<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
        (function() {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }

        /* Ecrã de carregamento inicial */
        #initial-loading {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #e5edf2;
            z-index: 9999;
            transition: opacity 0.25s ease;
        }

        #initial-loading.hidden {
            opacity: 0;
            pointer-events: none;
        }

        #initial-loading .spinner {
            width: 46px;
            height: 46px;
            border-radius: 999px;
            border: 4px solid rgba(0, 0, 0, 0.08);
            border-top-color: #1f4c6b;
            animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
            to {
                transform: rotate(360deg);
            }
        }
    </style>

    <title inertia>{{ config('app.name', 'Biblioteca Brotero - Biblioteca Online') }}</title>

    <link rel="icon" type="image/png" href="/images/logo.png">
    <link rel="apple-touch-icon" href="/images/logo.png">

    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>

<body class="font-sans antialiased">
    <div id="initial-loading">
        <div class="spinner" aria-label="A carregar..."></div>
    </div>
    @inertia
</body>

</html>