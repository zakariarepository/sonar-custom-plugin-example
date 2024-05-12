/*
 * Copyright (C) 2009-2020 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
// Necessary for setting up, because of Webpack.
import Backbone from "backbone";
import $ from 'jquery';
import _ from "underscore";
import '../style.css';
import React from 'react';
import InstanceDynamicApp from './components/InstanceDynamicApp';

window.$ = $;
window._ = _;
window.Backbone = Backbone;
window.app = window.app || {};


window.registerExtension('example/project_page', async function (options) {
  //const container = options.el;
  const container = options.el;
  ReactDOM.render(<InstanceDynamicApp project={options.component}/>, container);
});


