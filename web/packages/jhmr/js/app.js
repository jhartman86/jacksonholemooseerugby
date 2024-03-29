/* global FastClick, FB */
;(function( window, angular, undefined ){ 'use strict';

    angular.module('jhmr', ['jhmr.common', 'ngSanitize']).

    /**
    * @description App configuration
    * @param $provide
    * @param $locationProvider
    */
    config(['$provide',
        function( $provide ){

            /**
             * Normally we'd bind a directive to pickup the data attribute fb-sdk
             * and load the Facebook SDK within, but Facebook's javascript removes
             * /replaces the DOM node which makes angular's parsing of the directive
             * go schizo; so (since we're always loading this at the end of a page),
             * we just look for any DOM nodes with attr [fb-sdk], and then load it
             * here.
             */
            if( document.querySelectorAll('[fb-sdk]').length ){
                window.fbAsyncInit = function() {
                    FB.init({
                        appId      : '884434574982022',
                        xfbml      : true,
                        version    : 'v2.3'
                    });
                    console.log('✓ FacebookSDK');
                };

                (function(d, s, id){
                    var fbDiv = d.createElement('div'); fbDiv.id = 'fb-root'; d.body.appendChild(fbDiv);
                    var js, fjs = d.getElementsByTagName(s)[0];
                    if (d.getElementById(id)) {return;}
                    js = d.createElement(s); js.id = id;
                    js.src = "//connect.facebook.net/en_US/sdk.js";
                    fjs.parentNode.insertBefore(js, fjs);
                }(document, 'script', 'facebook-jssdk'));
            }

        }
    ]).

    /**
    * On run...
    */
    run(['$rootScope', '$window', '$timeout', '$q', 'FastClick', '$compile',
        function( $rootScope, $window, $timeout, $q, FastClick, $compile ){
            // Bind fastclick
            FastClick.attach(document.body);

            // C5 edit mode ONLY
            if( angular.element(document.documentElement).hasClass('cms-edit-mode') ){
                // Wait for ConcreteEvent to be available in the window...
                $q(function(resolve, reject){
                    (function _wait(){
                        $timeout(function(){
                            if( $window['ConcreteEvent'] ){
                                resolve($window['ConcreteEvent']);
                                return;
                            }
                            _wait();
                        }, 200);
                    })();
                }).then(function( ConcreteEvent ){
                    /**
                     * @todo: Find a better way to evaluate lazy-loaded directives after a
                     * block gets updated vs recompiling the entire document... That seems
                     * dangerous...
                     */
                    ConcreteEvent.subscribe('EditModeAddBlockComplete EditModeUpdateBlockComplete EditModeExitInlineSaved EditModeExitInline', function(){
                        $timeout(function(){
                            console.log("Recompiling DOM");
                            $compile(document.body)($rootScope);
                        }, 2000);
                    });
                });
            }
        }
    ]);


    /************************************************************
    Bootstrap angular manually vs. binding w/ ng-app in the DOM
    ************************************************************/
    angular.element(document).ready(function(){
        angular.bootstrap(document.body, ['jhmr']);
    });

})(window, window.angular);

angular.module('jhmr.common', []);
/* global Power2 */
angular.module('jhmr.common').

    directive('nav', ['$window', 'Tween', function( $window, Tween ){

        function _link( scope, $elem, attrs ){

            var $html      = angular.element(document.documentElement),
                lastScroll = 0,
                threshold  = $elem[0].offsetTop, //$elem[0].getBoundingClientRect().top,
                isDocked   = false;

            // Dock handler
            Tween.ticker.addEventListener('tick', function(){
                if( lastScroll !== window.pageYOffset ){
                    lastScroll = window.pageYOffset;
                    if( (lastScroll > threshold) !== isDocked ){
                        isDocked = !isDocked;
                        $html.toggleClass('nav-docked', isDocked);
                    }
                }
            });

            // Navigate to handler
            angular.element($elem[0].querySelectorAll('a[href]')).on('click', function( e ){
                e.preventDefault();

                var target = document.querySelector(this.getAttribute('href'));
                if( target ){
                    Tween.to($window, 0.65, {
                        scrollTo:   {y:target.offsetTop},
                        ease:       Power2.easeOut
                    });
                }
            });
        }

        return {
            restrict: 'E',
            link:     _link
        };
    }]);
/* global Modernizr */
/* global FastClick */
angular.module('jhmr.common').

    /**
     * @description Modernizr provider
     * @param $window
     * @param $log
     * @returns Modernizr | false
     */
    provider('Modernizr', function(){
        this.$get = ['$window', '$log',
            function( $window, $log ){
                return $window['Modernizr'] || ($log.warn('Modernizr unavailable!'), false);
            }
        ];
    }).

    /**
     * @description TweenLite OR TweenMax provider
     * @param $window
     * @param $log
     * @returns TweenMax | TweenLite | false
     */
    provider('Tween', function(){
        this.$get = ['$window', '$log',
            function( $window, $log ){
                return $window['TweenMax'] || $window['TweenLite'] || ($log.warn('Greensock Tween library unavailable!'), false);
            }
        ];
    }).

    /**
     * @description FastClick provider
     * @param $window
     * @param $log
     * @returns FastClick | false
     */
    provider('FastClick', function(){
        this.$get = ['$window', '$log',
            function( $window, $log ){
                return $window['FastClick'] || ($log.warn('FastClick unavailable!'), false);
            }
        ];
    });