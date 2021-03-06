/*
 * Isomer - The distributed application framework
 * ==============================================
 * Copyright (C) 2011-2020 Heiko 'riot' Weinen <riot@c-base.org> and others.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
function requireAll(r) {
    r.keys().forEach(r);
    return r;
}

let backgrounds = null; //requireAll(require.context("../../../assets/images/backgrounds", true, /^(.*\.(jpg$))[^.]*$/igm));
let themes = null; //requireAll(require.context("../../themes", true, /\.scss$/));

class AppComponent {

    constructor(scope, user, socket, rootscope, objectproxy, state, notification, infoscreen, statusbar, navbar, systemconfig, hotkeys) {
        this.scope = scope;
        this.user = user;
        this.socket = socket;
        this.rootscope = rootscope;
        this.objectproxy = objectproxy;
        this.state = state;
        this.notification = notification;
        this.infoscreen = infoscreen;
        this.statusbar = statusbar;
        this.navbar = navbar;
        this.systemconfig = systemconfig;

        this.rotationenabled = infoscreen.enabled;
        this.rotationpaused = false;

        this.search_string = '';
        this.search_collapsed = true;

        this.clientconfiglist = [];
        this.clutter_visible = false;
        this.statusbar_visible = false;
        this.statusbar_history_visible = false;
        this.language_selector_open = false;

        console.log('[APP] Backgrounds:', backgrounds);
        console.log('[APP] Themes:', themes);

        this.stylesheets = {
            default: '',
            dark: "src/components/nightshift/assets/themes/nightshift/bootstrap.css",
        }

        hotkeys.add({
            combo: 'ctrl+alt+n',
            description: 'Toggle dark theme',
            callback: function() {
                if (self.user.theme === "default") {
                    self.user.theme = "dark";
                } else {
                    self.user.theme = "default";
                }
            }
        })

        hotkeys.add({
            combo: '~',
            description: 'Toggle statusbar details',
            callback: function () {
                self.statusbar_visible = !self.statusbar_visible;
                if (self.statusbar_visible === true) {
                    self.statusbar_history_visible = true;
                    self.statusbar.alerting = false;
                }
            }
        });
        hotkeys.add({
            combo: 'f2',
            description: 'Go to feature menu',
            callback: function () {
                self.state.go('app.menu');
            }
        });
        hotkeys.add({
            combo: 'ctrl+alt+a',
            description: 'Go to About',
            callback: function () {
                self.state.go('app.about');
            }
        });
        hotkeys.add({
            combo: 'ctrl+alt+o',
            description: 'Immediately log out',
            callback: function () {
                console.log('[APP] Logging out.');
                self.user.logout(true, true);
            }
        });
        hotkeys.add({
            combo: 'alt+h',
            description: 'Hide navigation and sidebars',
            callback: function () {
                self.clutter_visible = !self.clutter_visible;
                self.user.mainmenu_visible = self.clutter_visible;
                self.statusbar_visible = self.clutter_visible;
            }
        });
        hotkeys.add({
            // TODO: Switch focus to language selector on hotkey
            //  otherwise this one is not really helpful...
            combo: 'alt+i',
            description: 'Open & focus language selector',
            callback: function () {
                self.language_selector_open = !self.language_selector_open;
            }
        });
        hotkeys.add({
            // TODO: Switch focus to language selector on hotkey
            //  otherwise this one is not really helpful...
            combo: 'ctrl+alt+d',
            description: 'Toggle debug mode',
            callback: function () {
                self.user.debug = !self.user.debug;
            }
        });

        this.navbar.set_scope(scope);

        for (let theme in themes) {
            console.log('[APP] Theme:', theme, theme.id, theme.resolve, theme.keys);
        }

        let self = this;

        this.socket.listen('isomer.ui.tagmanager', function (msg) {
            console.log('[APP] Tag manager result:', msg);
        });

        // TODO: Move to infoscreen service
        this.rotationpause = function () {
            this.rotationpaused = !this.rotationpaused;
            this.infoscreen.toggleRotations(!this.rotationpaused);
        };

        // TODO: Move to infoscreen service
        this.rootscope.$on('Clientconfig.Update', function () {
            self.rotationenabled = self.infoscreen.enabled;
            console.log('Updating rotation to: ', self.rotationenabled);
        });

        this.rootscope.$on('Profile.Update', function () {
            // Set a nice background, if one is configured
            let background = self.user.profile.settings.background;
            //console.log("BG:", background, backgrounds);
            if (background !== 'default') {
                console.log('url(/assets/images/backgrounds/' + background + ')');
                $('body').css({
                    'background': 'url(/assets/images/backgrounds/' + background + ') no-repeat center center fixed',
                    'background-size': 'cover'
                });
            } else if (background === 'none') {
                $('body').css({
                    'background': 'none'
                });
            }
        });

        this.update_client_configurations = function () {
            console.log('[APP] Populating client menu.');
            // Request client list for the client menu
            self.objectproxy.search('client', {'owner': self.user.useruuid}).then(function (msg) {
                console.log('[APP] Clientconfiglist: ', msg);
                self.clientconfiglist = msg.data.list;
            });
        };

        this.user.onAuth(function () {
            self.update_client_configurations();
            // TODO: Move this (and the corresponding code in FeatureMenu) to a central service
            let menu = $('#modulemenu');
            let menu_dict = {};

            menu.empty();

            for (let state of self.state.get()) {
                if (typeof state.roles !== 'undefined') {
                    let found = false;
                    for (let role of state.roles) {
                        for (let check_role of self.user.account.roles) {
                            if (check_role === role) {
                                found = true;
                            }
                        }
                    }
                    if (found === false) {
                        continue;
                    }
                }
                if ('icon' in state) {
                    let menuentry = '<li><div><a href="#!' + state.url + '"><img class="module-icon-tiny" src="' + state.icon + '" type="image/svg+xml">' + state.label + '</a></div></li>';
                    menu_dict[state.label] = menuentry;
                }
            }

            let labels = Object.keys(menu_dict);
            labels.sort();

            for (let label of labels) {
                menu.append(menu_dict[label]);
            }
        });

        $('#bootscreen').hide();
        $(document).on('click', '.navbar-collapse.in', function (e) {
            if ($(e.target).is('a')) {
                $(this).collapse('hide');
            }
        });
    }

    userbutton() {
        this.user.login();
    }

    switchClientConfig(uuid) {
        this.user.switchClientconfig(uuid);
    }

    editClientConfig(uuid) {
        this.state.go('app.editor', {schema: 'client', action: 'edit', 'uuid': uuid});
    }

    deleteClientConfig(uuid) {
        this.objectproxy.deleteObject('client', uuid);
    }

    home(event) {
        if (event.shiftKey === true) {
            console.log('[MAIN] Reloading route.');
            this.socket.check();
            event.stopPropagation();
        } else if (event.ctrlKey === true && event.shiftKey === true) {
            console.log('[MAIN] Reconnecting');
            this.socket.reconnect();
            event.stopPropagation();
        } else if (!this.user.signedin) {
            if (this.socket.connected) {
                this.userbutton();
            } else {
                this.notification.add('danger', 'Not connected', 'This client is not connected to the node.', 3);
            }
            event.stopPropagation();
        }

    }

    search(event) {
        if (this.search_string !== '') {
            console.log('Would search now');
            let request = {
                component: 'isomer.ui.tagmanager',
                action: 'get_tagged',
                data: this.search_string
            };
            this.socket.send(request);
        } else {
            this.search_collapsed = !this.search_collapsed;
        }
    }

}

AppComponent.$inject = ['$scope', 'user', 'socket', '$rootScope', 'objectproxy', '$state', 'notification', 'infoscreen', 'statusbar', 'navbar', 'systemconfig', 'hotkeys'];

export default AppComponent;
