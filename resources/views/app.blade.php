<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark'=> ($appearance ?? 'system') == 'dark'])>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
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
            background-color: oklch(0.98 0.01 263);
            scrollbar-gutter: stable;
        }

        html.dark {
            background-color: oklch(0.12 0.02 263);
        }

        ::selection {
            background-color: oklch(0.55 0.18 263 / 0.2);
            color: oklch(0.55 0.18 263);
        }

        /* Ecrã de carregamento inicial */
        #initial-loading {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: oklch(0.98 0.01 263);
            z-index: 9999;
            transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #initial-loading.hidden {
            opacity: 0;
            pointer-events: none;
        }

        #initial-loading .spinner {
            width: 48px;
            height: 48px;
            border-radius: 999px;
            border: 3px solid oklch(0.9 0.01 263);
            border-top-color: oklch(0.55 0.18 263);
            animation: spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
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