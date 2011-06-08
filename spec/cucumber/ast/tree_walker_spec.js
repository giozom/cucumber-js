require('../../support/spec_helper');

describe("Cucumber.Ast.TreeWalker", function() {
  var Cucumber = require('cucumber');
  var treeWalker, features, supportCodeLibrary, listeners;

  beforeEach(function() {
    features           = createSpyWithStubs("Features AST element", {acceptVisitor: null});
    supportCodeLibrary = createSpy("Support code library");
    listeners          = [createSpy("First listener"), createSpy("Second listener")];
    spyOnStub(listeners, 'syncForEach').andCallFake(function(cb) { listeners.forEach(cb); });
    treeWalker         = Cucumber.Ast.TreeWalker(features, supportCodeLibrary, listeners);
  });

  describe("walk()", function() {
    var callback;

    beforeEach(function() {
      callback = createSpy("Callback");
    });

    beforeEach(function() {
      spyOn(treeWalker, 'visitFeatures');
    });

    it("visits all features", function() {
      treeWalker.walk(callback);
      expect(treeWalker.visitFeatures).toHaveBeenCalledWith(features, callback);
    });
  });

  describe("visitFeatures()", function() {
    var callback, event;

    beforeEach(function() {
      callback = createSpy("Callback");
      event    = createSpy("Event");
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
      spyOn(Cucumber.Ast.TreeWalker, 'Event').andReturn(event);
    });

    it("creates a new event about the features' visit", function() {
      treeWalker.visitFeatures(features, callback);
      expect(Cucumber.Ast.TreeWalker.Event).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.FEATURES_EVENT_NAME);
    });

    it("broadcasts the features' visit", function() {
      treeWalker.visitFeatures(features, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(event, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeatures(features, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[1];
      });


      it("visits the features, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(features.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitFeature()", function() {
    var feature, callback;

    beforeEach(function() {
      feature  = createSpyWithStubs("Feature AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("broadcasts the feature's visit", function() {
      treeWalker.visitFeature(feature, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.FEATURE_EVENT_NAME, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(feature, 2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 4);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeature(feature, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[2];
      });

      it("visits the feature, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(feature.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitScenario()", function() {
    var scenario, callback;

    beforeEach(function() {
      scenario = createSpyWithStubs("Scenario AST element", {acceptVisitor: null});
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("broadcasts the scenario's visit", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.SCENARIO_EVENT_NAME, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(scenario, 2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 4);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitScenario(scenario, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[2];
      });

      it("visits the scenario, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(scenario.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitStep()", function() {
    var step, callback;

    beforeEach(function() {
      step     = createSpyWithStubs("Step", {acceptVisitor: null});
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEventAroundUserFunction');
    });

    it("broadcasts the step's visit", function() {
      treeWalker.visitStep(step, callback);
      expect(treeWalker.broadcastEventAroundUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.STEP_EVENT_NAME, 1);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(step, 2);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
      expect(treeWalker.broadcastEventAroundUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 4);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitStep(step, callback);
        userFunction = treeWalker.broadcastEventAroundUserFunction.mostRecentCall.args[2];
      });

      it("visits the step, passing it the received callback", function() {
        userFunction(userFunctionCallback);
        expect(step.acceptVisitor).toHaveBeenCalledWith(treeWalker, userFunctionCallback);
      });
    });
  });

  describe("visitStepResult()", function() {
    var stepResult, callback;

    beforeEach(function() {
      stepResult = createSpy("Step result");
      callback   = createSpy("Callback");
      spyOn(treeWalker, 'broadcastEvent');
    });

    it("broadcasts the step result visit and the step result itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.STEP_RESULT_EVENT_NAME, stepResult, callback);
    });

    it("does not call back by itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("broadcastEventAroundUserFunction()", function() {
    var eventName, userFunction, callback, argumentList;
    var event, userFunctionWrapper;

    beforeEach(function() {
      eventName           = "SomeEvent";
      userFunction        = createSpy("User function");
      callback            = createSpy("Main callback");
      event               = createSpy("Event");
      userFunctionWrapper = createSpy("User function wrapper");
      argumentList        = [event, userFunction, callback];
      spyOn(treeWalker, 'extractEventFromArguments').andReturn(event);
      spyOn(treeWalker, 'extractUserFunctionFromArguments').andReturn(userFunction);
      spyOn(treeWalker, 'extractCallbackFromArguments').andReturn(callback);
      spyOn(treeWalker, 'wrapUserFunctionAndAfterEventBroadcast').andReturn(userFunctionWrapper);
      spyOn(treeWalker, 'broadcastBeforeEvent');
    });

    it("extracts the event from its variable argument list", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.extractEventFromArguments).toHaveBeenCalledWith(argumentList);
    });

    it("extracts the user function from its variable argument list", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.extractUserFunctionFromArguments).toHaveBeenCalledWith(argumentList);
    });

    it("extracts the callback from its variable argument list", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.extractCallbackFromArguments).toHaveBeenCalledWith(argumentList);
    });

    it("wraps the user function and after event broadcast together", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.wrapUserFunctionAndAfterEventBroadcast).toHaveBeenCalledWith(userFunction, event, callback);
    });

    it("broadcasts a before event with the user function and after event broadcast wrapper as callback", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.broadcastBeforeEvent).toHaveBeenCalledWith(event, userFunctionWrapper);
    });
  });

  describe("extractEventFromArguments()", function() {
    var argumentsObject, argumentsArray, event;

    beforeEach(function() {
      event           = createSpy("Event");
      argumentsObject = createSpy("Arguments object");
      argumentsArray  = createSpyWithStubs("Cucumber util arguments array", {slice: event});
      spyOn(Cucumber.Util, 'Arguments').andReturn(argumentsArray);
    });

    it("transforms the arguments object into an array", function() {
      treeWalker.extractEventFromArguments(argumentsObject);
      expect(Cucumber.Util.Arguments).toHaveBeenCalledWith(argumentsObject);
    });

    it("slices the non-event arguments off", function() {
      treeWalker.extractEventFromArguments(argumentsObject);
      expect(argumentsArray.slice).toHaveBeenCalledWith(
        Cucumber.Ast.TreeWalker.NON_EVENT_LEADING_PARAMETERS_COUNT,
        -Cucumber.Ast.TreeWalker.NON_EVENT_TRAILING_PARAMETERS_COUNT
      );
    });

    it("returns the array slice", function() {
      expect(treeWalker.extractEventFromArguments(argumentsObject)).
        toBe(event);
    });
  });

  describe("extractNonEventArgumentsFromArguments()", function() {
    var argumentsObject, argumentsArray, nonEventArguments;

    beforeEach(function() {
      nonEventArguments = createSpy("Non event arguments");
      argumentsObject     = createSpy("Arguments object");
      argumentsArray      = createSpyWithStubs("Cucumber util arguments array",
                                               {slice: nonEventArguments});
      spyOn(Cucumber.Util, 'Arguments').andReturn(argumentsArray);
    });

    it("transforms the arguments object into an array", function() {
      treeWalker.extractNonEventArgumentsFromArguments(argumentsObject);
      expect(Cucumber.Util.Arguments).toHaveBeenCalledWith(argumentsObject);
    });

     it("slices the event parameters off", function() {
       treeWalker.extractNonEventArgumentsFromArguments(argumentsObject);
       expect(argumentsArray.slice).toHaveBeenCalledWith(
        -Cucumber.Ast.TreeWalker.NON_EVENT_TRAILING_PARAMETERS_COUNT
      );
    });

    it("returns the array slice", function() {
      var returned = treeWalker.extractNonEventArgumentsFromArguments(argumentsObject);
      expect(returned).toBe(nonEventArguments);
    });
  });

  describe("extractUserFunctionFromArguments()", function() {
    var argumentsObject, userFunction, nonEventArguments;

    beforeEach(function() {
      userFunction      = createSpy("User function");
      argumentsObject   = createSpy("Arguments object");
      nonEventArguments = createSpyWithStubs("Non event arguments", {unshift: userFunction});
      spyOn(treeWalker, 'extractNonEventArgumentsFromArguments').
        andReturn(nonEventArguments);
    });

    it("extracts the non-event arguments from the arguments object", function() {
      treeWalker.extractUserFunctionFromArguments(argumentsObject);
      expect(treeWalker.extractNonEventArgumentsFromArguments).toHaveBeenCalledWith(argumentsObject);
    });

    it("shifts the first argument from the non-event arguments", function() {
      treeWalker.extractUserFunctionFromArguments(argumentsObject);
      expect(nonEventArguments.unshift).toHaveBeenCalled();
    });

    it("returns the unshifted argument", function() {
      var returned = treeWalker.extractUserFunctionFromArguments(argumentsObject);
      expect(returned).toBe(userFunction);
    });
  });

  describe("extractCallbackFromArguments()", function() {
    var argumentsObject, callback, nonEventArguments;

    beforeEach(function() {
      callback          = createSpy("User function");
      argumentsObject   = createSpy("Arguments object");
      nonEventArguments = createSpyWithStubs("Non event arguments", {pop: callback});
      spyOn(treeWalker, 'extractNonEventArgumentsFromArguments').
        andReturn(nonEventArguments);
    });

    it("extracts the non-event arguments from the arguments object", function() {
      treeWalker.extractCallbackFromArguments(argumentsObject);
      expect(treeWalker.extractNonEventArgumentsFromArguments).toHaveBeenCalledWith(argumentsObject);
    });

    it("pops the last argument out of the non-event arguments", function() {
      treeWalker.extractCallbackFromArguments(argumentsObject);
      expect(nonEventArguments.pop).toHaveBeenCalled();
    });

    it("returns the unshifted argument", function() {
      var returned = treeWalker.extractCallbackFromArguments(argumentsObject);
      expect(returned).toBe(callback);
    });
  });

  describe("wrapUserFunctionAndAfterEventBroadcast()", function() {
    var userFunction, event, callback;
    var broadcastAfterEventWrapper;

    beforeEach(function() {
      userFunction               = createSpy("User function");
      event                      = createSpy("Event");
      callback                   = createSpy("Callback");
      broadcastAfterEventWrapper = createSpy("After event broadcast wrapper");
      spyOn(treeWalker, 'wrapAfterEventBroadcast').andReturn(broadcastAfterEventWrapper);
    });

    it("wraps the after event broadcast to use as a callback", function() {
      treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      expect(treeWalker.wrapAfterEventBroadcast).toHaveBeenCalledWith(event, callback);
    });

    it("returns a wrapper function", function() {
      var returned = treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      expect(returned).toBeAFunction();
    });

    describe("returned wrapper function", function() {
      var wrapper;

      beforeEach(function() {
        wrapper = treeWalker.wrapUserFunctionAndAfterEventBroadcast(userFunction, event, callback);
      });

      it("calls the user function with the after event broadcast wrapper", function() {
        wrapper();
        expect(userFunction).toHaveBeenCalledWith(broadcastAfterEventWrapper);
      });
    });
  });

  describe("wrapAfterEventBroadcast()", function() {
    var event, callback;

    beforeEach(function() {
      event    = createSpy("Event");
      callback = createSpy("Callback");
    });

    it("returns a function", function() {
      var returned = treeWalker.wrapAfterEventBroadcast(event, callback);
      expect(returned).toBeAFunction();
    });

    describe("returned wrapper function", function() {
      var wrapper;

      beforeEach(function() {
        wrapper = treeWalker.wrapAfterEventBroadcast(event, callback);
        spyOn(treeWalker, 'broadcastAfterEvent');;
      });

      it("broadcasts an after event with the received callback as callback", function() {
        wrapper();
        expect(treeWalker.broadcastAfterEvent).toHaveBeenCalledWith(event, callback);
      });
    });
  });

  /*
  describe("broadcastEventAroundUserFunction()", function() {
    var event, userFunction, callback;
    var beforeEvent, afterEvent;
    var beforeEventBroadcasted, afterEventBrodcasted;

    beforeEach(function() {
      event                  = "EventEvent";
      userFunction             = createSpy("User function");
      callback                 = createSpy("Callback");
      beforeEvent            = Cucumber.Ast.TreeWalker.BEFORE_EVENT_NAME_PREFIX + event;
      afterEvent             = Cucumber.Ast.TreeWalker.AFTER_EVENT_NAME_PREFIX  + event;
      beforeEventBroadcasted = false;
      afterEventBroadcasted  = false;
      spyOn(treeWalker, 'broadcastEvent').andCallFake(function(event) {
        if (event == beforeEvent)
          beforeEventBroadcasted = true;
        if (event == afterEvent)
          afterEventBroadcasted = true;
      });
    });

    it("sends a 'before event' event with a caller to the user function as callback", function() {
      treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalled();
      expect(treeWalker.broadcastEvent).
        toHaveBeenCalledWithValueAsNthParameter(beforeEvent, 1);
      expect(treeWalker.broadcastEvent).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    it("sends a 'before event' event with additional parameters and the caller to the user function as callback", function() {
      var parameter1 = createSpy("First additional parameter");
      var parameter2 = createSpy("Second additional parameter");
      treeWalker.broadcastEventAroundUserFunction(event, parameter1, parameter2, userFunction, callback);
      expect(treeWalker.broadcastEvent).
        toHaveBeenCalledWithValueAsNthParameter(beforeEvent, 1);
      expect(treeWalker.broadcastEvent).
        toHaveBeenCalledWithValueAsNthParameter(parameter1, 2);
      expect(treeWalker.broadcastEvent).
        toHaveBeenCalledWithValueAsNthParameter(parameter2, 3);
      expect(treeWalker.broadcastEvent).
        toHaveBeenCalledWithAFunctionAsNthParameter(4);
    });

    describe("user function caller (before event broadcast callback)", function() {
      var userFunctionCaller, userFunctionCallerCallback;
      var afterEventbroadcastCaller, afterEventbroadcastCallerCallback;

      beforeEach(function() {
        treeWalker.broadcastEventAroundUserFunction(event, userFunction, callback);
        userFunctionCaller         = treeWalker.broadcastEvent.mostRecentCall.args[1];
        userFunctionCallerCallback = createSpy("User function caller callback");
      });

      it("calls the user function with a caller to an after event broadcast as callback", function() {
        userFunctionCaller(userFunctionCallerCallback);
        expect(userFunction).
          toHaveBeenCalledWithAFunctionAsNthParameter(1);
      });

      describe("caller to after event broadcast (user function callback)", function() {
        beforeEach(function() {
          userFunctionCaller(userFunctionCallerCallback);
          afterEventBroadcastCaller         = userFunction.mostRecentCall.args[0];
          afterEventBroadcastCallerCallback = createSpy("After event broadcast caller callback");
        });

        it("sends an 'after' event event with a callback", function() {
          afterEventBroadcastCaller(afterEventBroadcastCallerCallback);
          expect(treeWalker.broadcastEvent).toHaveBeenCalled();
          expect(treeWalker.broadcastEvent).
            toHaveBeenCalledWithValueAsNthParameter(afterEvent, 1);
          expect(treeWalker.broadcastEvent).
            toHaveBeenCalledWithAFunctionAsNthParameter(2);
        });

        it("sends an 'after event' event with additional parameters and a callback", function() {
          var parameter1 = createSpy("First additional parameter");
          var parameter2 = createSpy("Second additional parameter");
          treeWalker.broadcastEventAroundUserFunction(event, parameter1, parameter2, userFunction, callback);
          expect(treeWalker.broadcastEvent).
            toHaveBeenCalledWithValueAsNthParameter(beforeEvent, 1);
          expect(treeWalker.broadcastEvent).
            toHaveBeenCalledWithValueAsNthParameter(parameter1, 2);
          expect(treeWalker.broadcastEvent).
            toHaveBeenCalledWithValueAsNthParameter(parameter2, 3);
          expect(treeWalker.broadcastEvent).
            toHaveBeenCalledWithAFunctionAsNthParameter(4);
        });

      });
    });
    */
    /*
    it("broadcasts an optional parameter in both before and after events", function() {
      var parameter = createSpy("Additional parameter");
      treeWalker.broadcastEventAroundUserFunction(event, parameter, userFunction, callback);
      var beforeEventBroadcastCall = treeWalker.broadcastEvent.calls[0];
      expect(beforeEventBroadcastCall.args[0]).toBe(beforeEvent);
      expect(beforeEventBroadcastCall.args[1]).toBe(parameter);
      expect(beforeEventBroadcastCall.args[2]).toBeAFunction();
      var afterEventBroadcastCall = treeWalker.broadcastEvent.calls[1];
      expect(afterEventBroadcastCall.args[0]).toBe(afterEvent);
      expect(afterEventBroadcastCall.args[1]).toBe(parameter);
      expect(afterEventBroadcastCall.args[2]).toBeAFunction();
    }); */

    /*
      it("broadcasts any optional parameter in both before and after events", function() {
      var parameter1 = createSpy("Additional parameter 1");
      var parameter2 = createSpy("Additional parameter 2");
      var parameter3 = createSpy("Additional parameter 3");
      treeWalker.broadcastEventAroundUserFunction(event, parameter1, parameter2, parameter3, callback);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(beforeEvent, parameter1, parameter2, parameter3);
      expect(treeWalker.broadcastEvent).toHaveBeenCalledWith(afterEvent, parameter1, parameter2, parameter3);
    });
  });
  */

  describe("broadcastEvent()", function() {
    var eventName, hearMethod;

    beforeEach(function() {
      eventName  = "Event name";
      hearMethod = Cucumber.Ast.TreeWalker.HEAR_METHOD_PREFIX + eventName;
      listeners.forEach(function(listener) {
        spyOnStub(listener, hearMethod);
      });
    });

    it("tells every listener about the event", function() {
      treeWalker.broadcastEvent(eventName);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalled();
      });
    });

    it("passes an optional additional parameter to the listeners", function() {
      var parameter = createSpy("Additional parameter");
      treeWalker.broadcastEvent(eventName, parameter);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalledWith(parameter);
      });
    });

    it("passes any additional parameter to the listeners", function() {
      var parameter1 = createSpy("Additional parameter 1");
      var parameter2 = createSpy("Additional parameter 2");
      var parameter3 = createSpy("Additional parameter 3");
      treeWalker.broadcastEvent(eventName, parameter1, parameter2, parameter3);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalledWith(parameter1, parameter2, parameter3);
      });
    });
  });

  describe("lookupStepDefinitionByName()", function() {
    var stepName, stepDefinition;

    beforeEach(function() {
      stepName       = createSpy("Step name");
      stepDefinition = createSpy("Step definition");
      spyOnStub(supportCodeLibrary, 'lookupStepDefinitionByName').andReturn(stepDefinition);
    });

    it("asks the support code library for the step definition", function() {
      treeWalker.lookupStepDefinitionByName(stepName);
      expect(supportCodeLibrary.lookupStepDefinitionByName).toHaveBeenCalledWith(stepName);
    });

    it("returns the step definition returned by the library", function() {
      expect(treeWalker.lookupStepDefinitionByName(stepName)).toBe(stepDefinition);
    });
  });
});
