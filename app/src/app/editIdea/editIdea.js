function EditIdeaCtrl ($scope, $filter) {
    $scope.idea = {
        id: 15
    };

    function getIdeaDetails(Idea) {
        /*if(editIdea === undefined || editIdea.IdeaId !== selectedIdea.IdeaId){
            clearIdeaForm(eSubmitType.Update);
        }*/
        // TODO: from portfolioSetttings
        var maxIdeasAge = 165;

        //SecurityWebService.GetSecurityInfo(Idea.Ticker,getSecurityInfoCallback,GetCallbackFailed,ideaEditDiv);
        $scope.idea.StartPrice = $filter('roundNumber')(Idea.StartPrice, 2);
        $scope.idea.SecurityNameEdit = Idea.Ticker;
        $scope.idea.SideEdit = (Idea.Side == 1) ? 'BUY' : 'SELL';
        $scope.idea.SideEditStyle = (Idea.Side == 1) ? 'Green' : '#DD4444';
        $scope.idea.textTargetPrice = Idea.PriceTarget;
        $scope.idea.textDesiredSizeinUnits = $filter('addCommas')(Math.abs(Idea.NewQuantity));
        $scope.idea.AnalystEdit = Idea.Analyst;
        $scope.idea.reopenIdeaButton = Idea.DaysActive > maxIdeasAge;
        $scope.idea.textTargetReturn = $filter('roundNumber')((Idea.PriceTarget-Idea.StartPrice)/Idea.StartPrice*100*((Idea.Side == 1) ? 1 : -1), 2);
    }

    $scope.$on('ideaSelected', function(event, data) {
        getIdeaDetails(data);
    });
}

angular.module('editIdea', [])

.constant('editIdeaTabSettings', {
    id: 'editIdea',
    title: 'editIdea.title',
    controller: EditIdeaCtrl,
    template: 'createIdea/createIdea.tpl.html',
    requiredIdea: true
})


.controller('EditIdeaCtrl', ['$scope', '$filter']);