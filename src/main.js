/*
@DEV: EDIT THE TEMPLATE, NOT THE ACTUAL CONFIGURATION
Otherwise, your changes will be overwritten by the
frontend build process.
 */

// DO NOT EDIT MAIN.JS! IF YOU NEED TO CHANGE ANYTHING
// HERE, CHANGE THE TEMPLATE. OTHERWISE, YOUR CHANGES
// WILL BE LOST.

// Styles
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/css/bootstrap-theme.min.css';
import 'bootstrap-additions/dist/bootstrap-additions.css';
import 'font-awesome/css/font-awesome.min.css';
import './main.scss';

// 3rd party modules
//import bootstrap from 'bootstrap';
import angular from 'angular';
import animate from 'angular-animate';
import cookies from 'angular-cookies';
import draggable from 'ng-draggable';
import fullscreen from '@kariudo/angular-fullscreen';
import touch from 'angular-touch'
import md5 from 'angular-md5';
import schemaForm from 'angular-schema-form';
import bootstrapdecorator from 'angular-schema-form-bootstrap';

// HFOS Core Modules
import app from './app/app.module';
import common from './common/common.module';
import featuremenu from './featuremenu/featuremenu.module';
import objects from './objects/objects.module';
import about from './about/about.module';
import doc from './doc/doc.module';

require('humanize-duration');

// HFOS Plugin Modules

let modules = ['mgcrea.ngStrap', 'gridster', 'schemaForm', 'ngDraggable', 'FBAngular',
    animate, app, common, objects, cookies, touch, md5, featuremenu, about, doc
];

/* COMPONENT SECTION:BEGIN */
import taskgrid from './components/projectservice/taskgrid.module';
modules.push(taskgrid);
import library from './components/library/library.module';
modules.push(library);
import garden from './components/garden/garden.module';
modules.push(garden);
import chat from './components/chat/chat.module';
modules.push(chat);
import robot from './components/rcmanager/robot.module';
modules.push(robot);
import map from './components/map/map.module';
modules.push(map);
import dashboard from './components/dashboard/dashboard.module';
modules.push(dashboard);
import navdata from './components/navdata/navdata.module';
modules.push(navdata);
/* COMPONENT SECTION:END */


angular.module('main', modules);

angular.element(document).ready(() => {
    angular.bootstrap(document, ['main']);
});

