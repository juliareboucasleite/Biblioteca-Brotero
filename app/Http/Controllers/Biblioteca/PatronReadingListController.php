<?php

namespace App\Http\Controllers\Biblioteca;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\LibraryPatron;
use App\Models\PatronReadingList;
use App\Models\TeacherBookReservation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PatronReadingListController extends Controller
{
    private function ensureDefaultLists(LibraryPatron $patron): void
    {
        if ($patron->role() !== LibraryPatron::ROLE_STUDENT) {
            return;
        }

        $patron->readingLists()->firstOrCreate([
            'type' => PatronReadingList::TYPE_READ_LATER,
        ], [
            'name' => 'Ler depois',
            'visibility' => 'private',
        ]);

        $patron->readingLists()->firstOrCreate([
            'type' => PatronReadingList::TYPE_READING_NOW,
        ], [
            'name' => 'Em leitura',
            'visibility' => 'private',
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();
        $this->ensureDefaultLists($patron);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'type' => ['nullable', 'in:custom,classroom'],
            'classroom' => ['nullable', 'string', 'max:120'],
            'theme' => ['nullable', 'string', 'max:160'],
        ]);

        $name = trim((string) $data['name']);
        if ($name === '') {
            return back()->with('error', 'Indique um nome para a lista.');
        }

        $exists = $patron->readingLists()
            ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
            ->exists();

        if ($exists) {
            return back()->with('error', 'Já existe uma lista com esse nome.');
        }

        $type = (string) ($data['type'] ?? PatronReadingList::TYPE_CUSTOM);
        $isClassroom = $type === PatronReadingList::TYPE_CLASSROOM;

        if ($isClassroom && $patron->role() !== LibraryPatron::ROLE_TEACHER) {
            return back()->with('error', 'Só professoras/es podem criar listas de turma.');
        }

        $patron->readingLists()->create([
            'name' => $name,
            'type' => $type,
            'visibility' => $isClassroom ? 'shared' : 'private',
            'classroom' => $isClassroom ? trim((string) ($data['classroom'] ?? '')) ?: null : null,
            'theme' => $isClassroom ? trim((string) ($data['theme'] ?? '')) ?: null : null,
            'share_code' => $isClassroom ? strtoupper(Str::random(6)) : null,
            'share_token' => $isClassroom ? Str::random(32) : null,
        ]);

        return back()->with('success', 'Lista criada.');
    }

    public function storeBook(Request $request, Book $book): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();
        $this->ensureDefaultLists($patron);

        $data = $request->validate([
            'list_id' => ['nullable', 'integer'],
            'list_name' => ['nullable', 'string', 'max:120'],
            'progress_percent' => ['nullable', 'integer', 'min:0', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1', 'max:50000'],
            'reading_status' => ['nullable', 'in:not_started,reading,finished'],
        ]);

        $list = null;
        if (! empty($data['list_id'])) {
            $list = $patron->readingLists()->whereKey((int) $data['list_id'])->first();
        }

        if ($list === null) {
            $name = trim((string) ($data['list_name'] ?? ''));
            if ($name === '') {
                $name = 'Ler depois';
            }

            $list = $patron->readingLists()
                ->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])
                ->first();

            if ($list === null) {
                $list = $patron->readingLists()->create([
                    'name' => $name,
                ]);
            }
        }

        $progress = (int) ($data['progress_percent'] ?? 0);
        $status = (string) ($data['reading_status'] ?? ($progress > 0 ? 'reading' : 'not_started'));
        $startedAt = $status === 'reading' || $status === 'finished' ? now() : null;
        $finishedAt = $status === 'finished' ? now() : null;

        $list->books()->syncWithoutDetaching([
            $book->id => [
                'progress_percent' => $progress,
                'current_page' => $data['current_page'] ?? null,
                'reading_status' => $status,
                'started_at' => $startedAt,
                'finished_at' => $finishedAt,
            ],
        ]);

        return back()->with('success', 'Livro guardado na lista.');
    }

    public function updateBookProgress(Request $request, PatronReadingList $readingList, Book $book): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();
        if ($readingList->library_patron_id !== $patron->id) {
            abort(403);
        }

        $data = $request->validate([
            'progress_percent' => ['required', 'integer', 'min:0', 'max:100'],
            'current_page' => ['nullable', 'integer', 'min:1', 'max:50000'],
            'reading_status' => ['nullable', 'in:not_started,reading,finished'],
        ]);

        $status = (string) ($data['reading_status'] ?? ((int) $data['progress_percent'] === 100 ? 'finished' : 'reading'));

        $readingList->books()->updateExistingPivot($book->id, [
            'progress_percent' => (int) $data['progress_percent'],
            'current_page' => $data['current_page'] ?? null,
            'reading_status' => $status,
            'started_at' => $status === 'not_started' ? null : now(),
            'finished_at' => $status === 'finished' ? now() : null,
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Progresso atualizado.');
    }

    public function share(Request $request, PatronReadingList $readingList): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();
        if ($readingList->library_patron_id !== $patron->id || $patron->role() !== LibraryPatron::ROLE_TEACHER) {
            abort(403);
        }

        if ($readingList->share_code === null) {
            $readingList->forceFill([
                'share_code' => strtoupper(Str::random(6)),
                'share_token' => Str::random(32),
                'visibility' => 'shared',
            ])->save();
        }

        return back()->with('success', 'Lista preparada para partilha.');
    }

    public function importShared(Request $request): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();

        $data = $request->validate([
            'share_code' => ['nullable', 'string', 'max:12'],
            'share_token' => ['nullable', 'string', 'max:64'],
        ]);

        $code = strtoupper(trim((string) ($data['share_code'] ?? '')));
        $token = trim((string) ($data['share_token'] ?? ''));

        if ($code === '' && $token === '') {
            return back()->with('error', 'Indique um código ou link de partilha.');
        }

        $query = PatronReadingList::query()->where('visibility', 'shared');
        if ($token !== '') {
            $query->where('share_token', $token);
        } else {
            $query->where('share_code', $code);
        }

        /** @var PatronReadingList|null $shared */
        $shared = $query->with('books')->first();
        if ($shared === null) {
            return back()->with('error', 'Lista partilhada não encontrada.');
        }

        $newList = $patron->readingLists()->create([
            'name' => $shared->name.' (partilhada)',
            'type' => PatronReadingList::TYPE_CUSTOM,
            'visibility' => 'private',
        ]);

        $syncData = [];
        foreach ($shared->books as $book) {
            $syncData[$book->id] = [
                'progress_percent' => 0,
                'current_page' => null,
                'reading_status' => 'not_started',
                'started_at' => null,
                'finished_at' => null,
            ];
        }
        if ($syncData !== []) {
            $newList->books()->sync($syncData);
        }

        return back()->with('success', 'Lista partilhada importada.');
    }

    public function reserve(Request $request, PatronReadingList $readingList): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();
        if ($readingList->library_patron_id !== $patron->id || $patron->role() !== LibraryPatron::ROLE_TEACHER) {
            abort(403);
        }

        $data = $request->validate([
            'book_id' => ['required', 'integer', 'exists:books,id'],
            'copies' => ['required', 'integer', 'min:1', 'max:60'],
            'classroom' => ['required', 'string', 'max:120'],
            'theme' => ['nullable', 'string', 'max:160'],
            'reserved_for_date' => ['nullable', 'date'],
        ]);

        TeacherBookReservation::query()->create([
            'library_patron_id' => $patron->id,
            'book_id' => (int) $data['book_id'],
            'copies' => (int) $data['copies'],
            'classroom' => trim((string) $data['classroom']),
            'theme' => trim((string) ($data['theme'] ?? '')) ?: null,
            'reserved_for_date' => $data['reserved_for_date'] ?? null,
        ]);

        return back()->with('success', 'Reserva para turma registada.');
    }

    public function destroyBook(PatronReadingList $readingList, Book $book): RedirectResponse
    {
        /** @var LibraryPatron $patron */
        $patron = Auth::guard('patron')->user();

        if ($readingList->library_patron_id !== $patron->id) {
            abort(403);
        }

        $readingList->books()->detach($book->id);

        return back()->with('success', 'Livro removido da lista.');
    }
}
