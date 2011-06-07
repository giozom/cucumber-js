require('../../support/spec_helper');

describe("Cucumber.Ast.TreeWalker", function() {
  var Cucumber     = require('cucumber');
  var EventEmitter = require('events').EventEmitter;
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
    var callback;

    beforeEach(function() {
      callback = createSpy("Callback");
      spyOn(treeWalker, 'broadcastUserFunction');
    });

    it("broadcasts the features' visit", function() {
      treeWalker.visitFeatures(features, callback);
      expect(treeWalker.broadcastUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.FEATURES_MESSAGE, 1);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 3);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeatures(features, callback);
        userFunction = treeWalker.broadcastUserFunction.mostRecentCall.args[1];
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
      spyOn(treeWalker, 'broadcastUserFunction');
    });

    it("broadcasts the feature's visit", function() {
      treeWalker.visitFeature(feature, callback);
      expect(treeWalker.broadcastUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.FEATURE_MESSAGE, 1);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(feature, 2);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 4);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitFeature(feature, callback);
        userFunction = treeWalker.broadcastUserFunction.mostRecentCall.args[2];
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
      spyOn(treeWalker, 'broadcastUserFunction');
    });

    it("broadcasts the scenario's visit before and after it", function() {
      treeWalker.visitScenario(scenario, callback);
      expect(treeWalker.broadcastUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.SCENARIO_MESSAGE, 1);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(scenario, 2);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 4);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitScenario(scenario, callback);
        userFunction = treeWalker.broadcastUserFunction.mostRecentCall.args[2];
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
      spyOn(treeWalker, 'broadcastUserFunction');
    });

    it("broadcasts the step's visit", function() {
      treeWalker.visitStep(step, callback);
      expect(treeWalker.broadcastUserFunction).toHaveBeenCalled();
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(Cucumber.Ast.TreeWalker.STEP_MESSAGE, 1);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(step, 2);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithAFunctionAsNthParameter(3);
      expect(treeWalker.broadcastUserFunction).
        toHaveBeenCalledWithValueAsNthParameter(callback, 4);
    });

    describe("user function", function() {
      var userFunction, userFunctionCallback;

      beforeEach(function() {
        userFunctionCallback = createSpy("User function callback");
        treeWalker.visitStep(step, callback);
        userFunction = treeWalker.broadcastUserFunction.mostRecentCall.args[2];
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
      spyOn(treeWalker, 'broadcastMessage');
    });

    it("broadcasts the step result visit and the step result itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(Cucumber.Ast.TreeWalker.STEP_RESULT_MESSAGE, stepResult, callback);
    });

    it("does not call back by itself", function() {
      treeWalker.visitStepResult(stepResult, callback);
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("broadcastUserFunction()", function() {
    var message, userFunction, callback, argumentList;
    var payload, wrappedUserFunction;

    beforeEach(function() {
      message             = "SomeEventMessage";
      userFunction        = createSpy("User function");
      callback            = createSpy("Main callback");
      payload             = createSpy("Message payload");
      wrappedUserFunction = createSpy("Wrapped user function");
      argumentList        = [message, userFunction, callback];
      spyOn(treeWalker, 'extractMessagePayloadFromArguments').andReturn(payload);
      spyOn(treeWalker, 'extractUserFunctionFromArguments').andReturn(userFunction);
      spyOn(treeWalker, 'extractCallbackFromArguments').andReturn(callback);
      spyOn(treeWalker, 'wrapUserFunctionAndAfterMessageBroadcast').andReturn(wrappedUserFunction);
      spyOn(treeWalker, 'broadcastBeforeMessage');
    });

    it("extracts the payload from its variable argument list", function() {
      treeWalker.broadcastUserFunction(message, userFunction, callback);
      expect(treeWalker.extractMessagePayloadFromArguments).toHaveBeenCalledWith(argumentList);
    });

    it("extracts the user function from its variable argument list", function() {
      treeWalker.broadcastUserFunction(message, userFunction, callback);
      expect(treeWalker.extractUserFunctionFromArguments).toHaveBeenCalledWith(argumentList);
    });

    it("extracts the callback from its variable argument list", function() {
      treeWalker.broadcastUserFunction(message, userFunction, callback);
      expect(treeWalker.extractCallbackFromArguments).toHaveBeenCalledWith(argumentList);
    });

    it("wraps the user function and after message broadcast together", function() {
      treeWalker.broadcastUserFunction(message, userFunction, callback);
      expect(treeWalker.wrapUserFunctionAndAfterMessageBroadcast).toHaveBeenCalledWith(userFunction, payload, callback);
    });

    it("broadcasts the before message with the wrapped user function and after message broadcast as callback", function() {
      treeWalker.broadcastUserFunction(message, userFunction, callback);
      expect(treeWalker.broadcastBeforeMessage).toHaveBeenCalledWith(payload, wrappedUserFunction);
    });
  });

  describe("extractMessagePayloadFromArguments()", function() {
    var argumentsObject, argumentsArray, payload;

    beforeEach(function() {
      payload         = createSpy("Payload");
      argumentsObject = createSpy("Arguments object");
      argumentsArray  = createSpyWithStubs("Cucumber util arguments array", {slice: payload});
      spyOn(Cucumber.Util, 'Arguments').andReturn(argumentsArray);
    });

    it("transforms the arguments object into an array", function() {
      treeWalker.extractMessagePayloadFromArguments(argumentsObject);
      expect(Cucumber.Util.Arguments).toHaveBeenCalledWith(argumentsObject);
    });

    it("slices the non-payload parameters off", function() {
      treeWalker.extractMessagePayloadFromArguments(argumentsObject);
      expect(argumentsArray.slice).toHaveBeenCalledWith(
        Cucumber.Ast.TreeWalker.NON_PAYLOAD_LEADING_PARAMETERS_COUNT,
        -Cucumber.Ast.TreeWalker.NON_PAYLOAD_TRAILING_PARAMETERS_COUNT
      );
    });

    it("returns the array slice", function() {
      expect(treeWalker.extractMessagePayloadFromArguments(argumentsObject)).
        toBe(payload);
    });
  });

  describe("extractUserFunctionFromArguments()", function() {
    var argumentsObject, userFunction, nonPayloadArguments;

    beforeEach(function() {
      userFunction        = createSpy("User function");
      argumentsObject     = createSpy("Arguments object");
      nonPayloadArguments = createSpyWithStubs("Non payload arguments", {unshift: userFunction});
      spyOn(treeWalker, 'extractNonMessagePayloadArgumentsFromArguments').
        andReturn(nonPayloadArguments);
    });

    it("extracts the non-payload arguments from the arguments object", function() {
      treeWalker.extractUserFunctionFromArguments(argumentsObject);
      expect(treeWalker.extractNonMessagePayloadArgumentsFromArguments).toHaveBeenCalledWith(argumentsObject);
    });

    it("shifts the first argument from the non-payload arguments", function() {
      treeWalker.extractUserFunctionFromArguments(argumentsObject);
      expect(nonPayloadArguments.unshift).toHaveBeenCalled();
    });

    it("returns the unshifted argument", function() {
      var returned = treeWalker.extractUserFunctionFromArguments(argumentsObject);
      expect(returned).toBe(userFunction);
    });
  });

  describe("extractNonMessagePayloadArgumentsFromArguments()", function() {
    var argumentsObject, argumentsArray, nonPayloadArguments;

    beforeEach(function() {
      nonPayloadArguments = createSpy("Non payload arguments");
      argumentsObject     = createSpy("Arguments object");
      argumentsArray      = createSpyWithStubs("Cucumber util arguments array",
                                           {slice: nonPayloadArguments});
      spyOn(Cucumber.Util, 'Arguments').andReturn(argumentsArray);
    });

    it("transforms the arguments object into an array", function() {
      treeWalker.extractNonMessagePayloadArgumentsFromArguments(argumentsObject);
      expect(Cucumber.Util.Arguments).toHaveBeenCalledWith(argumentsObject);
    });

     it("slices the payload parameters off", function() {
       treeWalker.extractNonMessagePayloadArgumentsFromArguments(argumentsObject);
       expect(argumentsArray.slice).toHaveBeenCalledWith(
        -Cucumber.Ast.TreeWalker.NON_PAYLOAD_TRAILING_PARAMETERS_COUNT
      );
    });

    it("returns the array slice", function() {
      var returned = treeWalker.extractNonMessagePayloadArgumentsFromArguments(argumentsObject);
      expect(returned).toBe(nonPayloadArguments);
    });
  });

  /*
  describe("broadcastUserFunction()", function() {
    var message, userFunction, callback;
    var beforeMessage, afterMessage;
    var beforeMessageBroadcasted, afterMessageBrodcasted;

    beforeEach(function() {
      message                  = "EventMessage";
      userFunction             = createSpy("User function");
      callback                 = createSpy("Callback");
      beforeMessage            = Cucumber.Ast.TreeWalker.BEFORE_MESSAGE_PREFIX + message;
      afterMessage             = Cucumber.Ast.TreeWalker.AFTER_MESSAGE_PREFIX  + message;
      beforeMessageBroadcasted = false;
      afterMessageBroadcasted  = false;
      spyOn(treeWalker, 'broadcastMessage').andCallFake(function(message) {
        if (message == beforeMessage)
          beforeMessageBroadcasted = true;
        if (message == afterMessage)
          afterMessageBroadcasted = true;
      });
    });

    it("sends a 'before event' message with a caller to the user function as callback", function() {
      treeWalker.broadcastUserFunction(message, userFunction, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalled();
      expect(treeWalker.broadcastMessage).
        toHaveBeenCalledWithValueAsNthParameter(beforeMessage, 1);
      expect(treeWalker.broadcastMessage).
        toHaveBeenCalledWithAFunctionAsNthParameter(2);
    });

    it("sends a 'before event' message with additional parameters and the caller to the user function as callback", function() {
      var parameter1 = createSpy("First additional parameter");
      var parameter2 = createSpy("Second additional parameter");
      treeWalker.broadcastUserFunction(message, parameter1, parameter2, userFunction, callback);
      expect(treeWalker.broadcastMessage).
        toHaveBeenCalledWithValueAsNthParameter(beforeMessage, 1);
      expect(treeWalker.broadcastMessage).
        toHaveBeenCalledWithValueAsNthParameter(parameter1, 2);
      expect(treeWalker.broadcastMessage).
        toHaveBeenCalledWithValueAsNthParameter(parameter2, 3);
      expect(treeWalker.broadcastMessage).
        toHaveBeenCalledWithAFunctionAsNthParameter(4);
    });

    describe("user function caller (before message broadcast callback)", function() {
      var userFunctionCaller, userFunctionCallerCallback;
      var afterMessagebroadcastCaller, afterMessagebroadcastCallerCallback;

      beforeEach(function() {
        treeWalker.broadcastUserFunction(message, userFunction, callback);
        userFunctionCaller         = treeWalker.broadcastMessage.mostRecentCall.args[1];
        userFunctionCallerCallback = createSpy("User function caller callback");
      });

      it("calls the user function with a caller to an after message broadcast as callback", function() {
        userFunctionCaller(userFunctionCallerCallback);
        expect(userFunction).
          toHaveBeenCalledWithAFunctionAsNthParameter(1);
      });

      describe("caller to after message broadcast (user function callback)", function() {
        beforeEach(function() {
          userFunctionCaller(userFunctionCallerCallback);
          afterMessageBroadcastCaller         = userFunction.mostRecentCall.args[0];
          afterMessageBroadcastCallerCallback = createSpy("After message broadcast caller callback");
        });

        it("sends an 'after' event message with a callback", function() {
          afterMessageBroadcastCaller(afterMessageBroadcastCallerCallback);
          expect(treeWalker.broadcastMessage).toHaveBeenCalled();
          expect(treeWalker.broadcastMessage).
            toHaveBeenCalledWithValueAsNthParameter(afterMessage, 1);
          expect(treeWalker.broadcastMessage).
            toHaveBeenCalledWithAFunctionAsNthParameter(2);
        });

        it("sends an 'after event' message with additional parameters and a callback", function() {
          var parameter1 = createSpy("First additional parameter");
          var parameter2 = createSpy("Second additional parameter");
          treeWalker.broadcastUserFunction(message, parameter1, parameter2, userFunction, callback);
          expect(treeWalker.broadcastMessage).
            toHaveBeenCalledWithValueAsNthParameter(beforeMessage, 1);
          expect(treeWalker.broadcastMessage).
            toHaveBeenCalledWithValueAsNthParameter(parameter1, 2);
          expect(treeWalker.broadcastMessage).
            toHaveBeenCalledWithValueAsNthParameter(parameter2, 3);
          expect(treeWalker.broadcastMessage).
            toHaveBeenCalledWithAFunctionAsNthParameter(4);
        });

      });
    });
    */
    /*
    it("broadcasts an optional parameter in both before and after events", function() {
      var parameter = createSpy("Additional parameter");
      treeWalker.broadcastUserFunction(message, parameter, userFunction, callback);
      var beforeMessageBroadcastCall = treeWalker.broadcastMessage.calls[0];
      expect(beforeMessageBroadcastCall.args[0]).toBe(beforeMessage);
      expect(beforeMessageBroadcastCall.args[1]).toBe(parameter);
      expect(beforeMessageBroadcastCall.args[2]).toBeAFunction();
      var afterMessageBroadcastCall = treeWalker.broadcastMessage.calls[1];
      expect(afterMessageBroadcastCall.args[0]).toBe(afterMessage);
      expect(afterMessageBroadcastCall.args[1]).toBe(parameter);
      expect(afterMessageBroadcastCall.args[2]).toBeAFunction();
    }); */

    /*
      it("broadcasts any optional parameter in both before and after events", function() {
      var parameter1 = createSpy("Additional parameter 1");
      var parameter2 = createSpy("Additional parameter 2");
      var parameter3 = createSpy("Additional parameter 3");
      treeWalker.broadcastUserFunction(message, parameter1, parameter2, parameter3, callback);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(beforeMessage, parameter1, parameter2, parameter3);
      expect(treeWalker.broadcastMessage).toHaveBeenCalledWith(afterMessage, parameter1, parameter2, parameter3);
    });
  });
  */

  describe("broadcastMessage()", function() {
    var message, hearMethod;

    beforeEach(function() {
      message     = "Message";
      hearMethod = Cucumber.Ast.TreeWalker.HEAR_METHOD_PREFIX + message;
      listeners.forEach(function(listener) {
        spyOnStub(listener, hearMethod);
      });
    });

    it("tells every listener about the message", function() {
      treeWalker.broadcastMessage(message);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalled();
      });
    });

    it("passes an optional additional parameter to the listeners", function() {
      var parameter = createSpy("Additional parameter");
      treeWalker.broadcastMessage(message, parameter);
      listeners.forEach(function(listener) {
        expect(listener[hearMethod]).toHaveBeenCalledWith(parameter);
      });
    });

    it("passes any additional parameter to the listeners", function() {
      var parameter1 = createSpy("Additional parameter 1");
      var parameter2 = createSpy("Additional parameter 2");
      var parameter3 = createSpy("Additional parameter 3");
      treeWalker.broadcastMessage(message, parameter1, parameter2, parameter3);
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
