<?php
// Application middleware

// e.g: $app->add(new \Slim\Csrf\Guard);
$menu_footer_midd = function ($request, $response, $next) {
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
            'href' => 'contact',
        ],
        'item4' => [
            'name' => 'Prihlásenie',
            'href' => '',
        ]

    ];

    $footer = '
                    
                    <div id="footer-bottom" class="row">
                        
                            <div class="copyright-text col-md-6 col-sm-6 col-xs-12">
                                <div class="copyright">
                                    © 2017, All rights reserved.
                                </div>
                            </div>
                            <div class="copyright-text col-md-6 col-sm-6 col-xs-12">
                                <div class="design">
                                    Designed by: Vcelicky TEAM
                                </div>
                            </div>
                        
                    </div>
            ';

    $request = $request->withAttribute('menu', $menu);
    $request = $request->withAttribute('footer', $footer);
    return $next($request, $response);
};

$app->add($menu_footer_midd);