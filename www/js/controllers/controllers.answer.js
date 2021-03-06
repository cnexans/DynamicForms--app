controllers.controller('AnswerCtrl', 
function($scope, $formsAPI, $localStorage, $auth, $ionicLoading, $stateParams, $q, $ionicPopup, $state)
{
	$scope.stateInfo = '';
	$scope.formId = $stateParams.formId;

	var fields    = $localStorage.getFormStructures();
	$scope.fields = [];

	for (var i = 0; i < fields.length; i++)
		if ( fields[i].form_id == $scope.formId )
			break;

	angular.forEach(fields[i].structure, function(value) {
		var fieldObj = {
			//Id del field descriptor, lo necesitaremos para enviar la respuesta..!
			field_descriptor_id : value.id,
			type     : value.type,
			label    : value.label,
			question : value.question
		}
		if ( fieldObj.type == 'OPTION' )
			fieldObj.options = value.options;
		$scope.fields.push(fieldObj);
	});

	$scope.sendAnswer = function()
	{
		var validity = true;
		var promises = [];
		angular.forEach($scope.fields, function (field, k) {
			var deferred = $q.defer();
			validity = validity && field.valid();
			deferred.resolve({
				'id'    : k,
				'valid' : field.valid()
			});
			promises.push(deferred);
		});

		$q.all(promises).then(function (fieldValidities) {
			if ( !validity )
			{
				$ionicPopup.alert({
					title: 'Ups',
					template: 'Alguno de los campos esta vacio, no olvide responderlo!'
				});
			}
			else
			{
				$localStorage.registerAnswer({
					'form_id' : $scope.formId,
					'answers' : $scope.fields
				});
				$ionicPopup.alert({
					title: 'Correcto',
					template: 'Se han guardado los datos, puede enviar las respuestas mediante el menu principal.'
				}).then(function() {
					$state.go('app.home');
				});
			}
		})
	}

});