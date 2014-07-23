function CreateIdeaCtrl ($scope) {
    $scope.idea = {};
}

angular.module('createIdea', [])

.constant('createIdeaTabSettings', {
    id: 'createIdea',
    title: 'createIdea.title',
    controller: CreateIdeaCtrl,
    template: 'createIdea/createIdea.tpl.html',
    requiredIdea: false
})

.controller('CreateIdeaCtrl', ['$scope']);