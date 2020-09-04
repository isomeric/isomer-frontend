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

import compareVersions from 'compare-versions';

class OverviewComponent {

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

        this.info = {
            restart_reasons: [],
            needs_restart: false,
            config: {},
        };
        this.config = {};
        this.upgradeable = false;

        let self = this;

        this.send = function(action, data) {
            self.socket.send({
                component: 'isomer.ui.instance',
                action: action,
                data: data
            });
        }

        this.requestData = function() {
            console.log('[INSTANCEINFO] User logged in, getting store data.');
            self.socket.send({
                component: 'isomer.ui.instance',
                action: 'get_instance_data',
                data: {}
            })
        }

        this.processData = function(msg) {
            console.log("[INSTANCEINFO] Data:", msg);

            if (msg.action === 'get_instance_data') {

                self.info = msg.data;
                self.config = self.info.context.instance_configuration;

                if (self.info.latest_version !== 'N/A') {
                    self.upgradeable = compareVersions(
                        self.info.latest_version, self.info.current_version
                    );
                }
            } else if (msg.action === 'upgrade_isomer') {
                self.info.needs_restart = true;
                if (self.info.restart_reasons.indexOf(msg.data) < 0) {
                    self.info.restart_reasons.push(msg.data)
                }
            }
        }

        this.socket.listen('isomer.ui.instance', this.processData);

        this.loginupdate = this.rootscope.$on('User.Login', function () {
            self.requestData();
        });

        if (this.user.signedin) {
            this.requestData();
        }
    }

    upgrade() {
        console.log('[INSTANCEINFO] Upgrading instance');
        this.send("upgrade_isomer")
    }
    
    restart() {
        console.log('[INSTANCEINFO] Requesting restart')
        this.send("restart_instance");
    }
}

OverviewComponent.$inject = [
    '$rootScope', 'user', 'socket', '$interval', 'notification', '$modal', '$state',
    'systemconfig', 'gettextCatalog'
];

export default OverviewComponent;
