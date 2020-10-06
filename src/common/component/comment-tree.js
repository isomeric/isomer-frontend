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

class commentTree {

    constructor($scope, $stateParams, user, socket, schemata, $rootscope, notification, state) {
        this.socket = socket;
        this.stateparams = $stateParams;
        this.schemata = schemata;
        this.rootscope = $rootscope;
        this.notification = notification;
        this.state = state;
        this.scope = $scope;

        this.success = null;
        this.comments = null;

        this.newComment = null;
        this.commentObject = null;

        this.debug = false;

        this.editorOptions = {
            language: 'en',
            uiColor: '#000000'
        };

        this.authors = {
            'author_uuid': 'Heinz Strunk',
            'another_author_uuid': 'Carmen Santiago'
        };

        this.comments = {
            'foobar-unique-id': {
                'text': 'Once in a time, there was a lone comment',
                'author': 'author_uuid',
                'votes': 5,
                'uuid': 'foo-bar-unique-id',
                'date': '2020-01-13T20:15:44.006Z'
            },
            'bazqux-unique-id': {
                'text': 'Also, there was a not so lone comment',
                'author': 'author_uuid',
                'uuid': 'foo-bar-unique-id',
                'votes': 6,
                'date': '2020-01-13T21:33:44.006Z',
                'items': {
                    'hamspam-unique-id': {
                        'text': 'Because it had a subcomment',
                        'author': 'another_author_uuid',
                        'uuid': 'ham-spam-unique-id',
                        'votes': 3,
                        'date': '2020-01-13T21:40:44.006Z'
                    },
                    'spamqux-unique-id': {
                        'text': '.. and even another subcomment',
                        'author': 'author_uuid',
                        'uuid': 'spamqux-unique-id',
                        'votes': -2,
                        'date': '2020-01-13T21:42:42.006Z'
                    }
                }
            }
        };

        let self = this;

        this.getData = function () {
            console.log('[C] Getting comments ');
            self.socket.send({
                comment: 'isomer.ui.commenter',
                action: 'getlist',
                data: self.commentObject
            });
        };

        this.loginupdate = this.rootscope.$on('User.Login', function () {
            console.log('[C] User logged in, getting current page.');
            // TODO: Check if user modified object - offer merging
            self.getData();
        });

        this.commentTreeUpdate = function (msg) {
            console.log('[C] Receiving comment-tree data:');
            if (msg.action === 'error' && msg.data === 'permission error') {
                self.notification.add('danger', 'No permission', 'You do not have administrative privileges necessary to reconfigure comments.', 5);
                self.comments = {}; // Deactivate spinner
                return;
            }
            if (msg.action === 'getlist') {
                self.comments = msg.data;
                console.log('Comments:', self.comments);
            } else if (msg.action === 'get') {
                console.log('[C] Receiving comment:', msg.data, self.configschemadata);
            } else if (msg.action === 'put') {
                if (msg.data) {
                    self.notification.add('success', 'Stored', 'Comment stored', 3);
                    self.stored = true;
                    self.modified = false;
                } else {
                    self.notification.add('danger', 'Not stored', 'Comment could not be stored', 5);
                    self.stored = false;
                }
            }
        };

        this.socket.listen('isomer.ui.commenter', this.commentTreeUpdate);

        if (user.signedin) {
            this.getData();
        }
    }

    submitForm() {
        let model = this.newComment;

        console.log('[C] Comment submit initialized with ', model);
        this.socket.send({
            comment: 'isomer.ui.commenter',
            action: 'put',
            data: this.newComment
        });
    }

    upVote(item) {
        console.log('[C] Would now upvote:', item);
    }

    downVote(item) {
        console.log('[C] Would now downvote:', item);
    }

}

commentTree.$inject = ['$scope', '$stateParams', 'user', 'socket', 'schemata', '$rootScope', 'notification', '$state'];

export default commentTree;
