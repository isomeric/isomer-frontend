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


class StoreComponent {

    constructor(rootscope, user, socket, $interval, notification, modal, state, 
                systemconfig, gettextCatalog) {
        this.rootscope = rootscope;
        this.user = user;
        this.socket = socket;
        this.notification = notification;
        this.modal = modal;
        this.$interval = $interval;
        this.state = state;
        this.systemconfig = systemconfig;
        this.gettextCatalog = gettextCatalog;

        let self = this;

        let boxSize = 150;

        this.all_packages = {};
        this.store = {};
        this.local = {};

        this.unupdateables = [];
        this.updateables = [];

        this.selected = "";
        this.search_string = "";

        this.send = function(action, packageName) {
            self.socket.send({
                component: 'isomer.ui.store',
                action: action,
                data: packageName
            });
        }

        this.requestData = function() {
            console.log('[STORE] User logged in, getting store data.');
            self.socket.send({
                component: 'isomer.ui.store',
                action: 'get_store_inventory',
                data: {}
            })
        }

        this.processData = function(msg) {
            console.log("[STORE] Data:", msg);
            self.store = msg.data.store;
            self.local = msg.data.local;
            self.all_packages = Object.assign({}, self.store.packages);
            for (let name in self.local.current) {
                let item = self.local.current[name]
                item.name = name;
                console.log('[STORE] Checking local package:', item);
                if (!self.all_packages.hasOwnProperty(item.name)) {

                    self.all_packages[item.name] = item;
                }
            }

            self.calculateUpdates();
        }


        this.calculateUpdates = function() {
            self.updateables = [];
            self.unupdateables = [];

            for (let name in self.all_packages) {
                let item = self.all_packages[name];
                let local_item = self.local.current[name];
                let store_item = self.store.packages[name];
                console.log("[STORE] Updatecheck:", local_item, store_item);
                //console.log("[STORE] VERSIONS:", local_item.version, store_item.version);
                if (typeof store_item === 'undefined') {
                    self.unupdateables.push(name);
                    continue
                }
                if (typeof local_item != 'undefined' && local_item.version < store_item.version) {
                    console.log('[STORE] Updateable:', name);
                    self.updateables.push(name);
                }
            }
        }

        this.socket.listen('isomer.ui.store', this.processData);

        this.loginupdate = this.rootscope.$on('User.Login', function () {
            self.requestData();
        });

        if (this.user.signedin) {
            this.requestData();
        }
    }

    install(packageName) {
        console.log('Installing package ', packageName);
        this.send("install", packageName)
    }

    uninstall(packageName) {
        console.log('Uninstalling package ', packageName);
        this.send("uninstall", packageName)
    }

    update(packageName) {
        console.log('Updating package ', packageName);
        this.send("update", packageName)
    }
}

StoreComponent.$inject = [
    '$rootScope', 'user', 'socket', '$interval', 'notification', '$modal', '$state',
    'systemconfig', 'gettextCatalog'
];

export default StoreComponent;
