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

import './store-component/store.scss';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import { routing } from './store.config.js';

import StoreComponent from './store-component/store-component';
import Template from './store-component/store-component.tpl.html';

export default angular
    .module('main.app.store', [uirouter])
    .config(routing)
    .component('storecomponent', {controller: StoreComponent, template: Template})
    .name;
