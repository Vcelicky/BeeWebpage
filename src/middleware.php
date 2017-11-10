<?php
// Application middleware

// e.g: $app->add(new \Slim\Csrf\Guard);
$menu_midd = function ($request, $response, $next) {
    // menu attributes contain name of menu item and href attr after that
    $menu = [
        'item1' => [
            'name' => 'Produkty',
            'href' => '#',
        ],
        'item2' => [
            'name' => 'Objednávka',
            'href' => '#',
        ],
        'item3' => [
            'name' => 'Kontakt',
            'href' => '#',
        ],
        'item5' => [
            'name' => 'Prihlásenie',
            'href' => '',
        ]

    ];

    $request = $request->withAttribute('menu', $menu);
    return $next($request, $response);
};

$app->add($menu_midd);