<?php
// Application middleware

// e.g: $app->add(new \Slim\Csrf\Guard);
$menu_footer_midd = function ($request, $response, $next) {
    // menu attributes contain name of menu item and href attr after that
    $menu = [
		'item0' => [
            'name' => 'Domov',
            'href' => '/BeeWebpage/public/',
        ],
        'item1' => [
            'name' => 'O produkte',
            'href' => '/BeeWebpage/public/products',
        ],
        'item2' => [
            'name' => 'Objednávka',
            'href' => '/BeeWebpage/public/order',
        ],
        'item3' => [
            'name' => 'Kontakt',
            'href' => '/BeeWebpage/public/contact',
        ],
        'item4' => [
            'name' => 'Prihlásenie',
            'href' => '',
        ]

    ];

    $footer = '
                    
                        <footer class="footer bg-light">
                            <div class="container">
                                <p class="m-0 text-center">Včeličky Team - FIIT STU, 2018</p>
                            </div>
                        </footer>
            ';

    $request = $request->withAttribute('menu', $menu);
    $request = $request->withAttribute('footer', $footer);
    return $next($request, $response);
};

$app->add($menu_footer_midd);