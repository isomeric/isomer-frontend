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

import './overview-component/overview.scss';

import angular from 'angular';
import uirouter from 'angular-ui-router';

import { routing } from './overview.config';

import OverviewComponent from './overview-component/overview-component';
import Template from './overview-component/overview-component.tpl.html';

export default angular
    .module('main.app.instance', [uirouter])
    .config(routing)
    .component('instanceoverviewcomponent', {controller: OverviewComponent, template: Template})
    .name;
