require('../../support/spec_helper');

describe("Cucumber.Listener.ProgressFormatter", function() {
  var Cucumber = require('cucumber');
  var listener, beforeEachScenarioUserFunctions;

  beforeEach(function() {
    beforeEachScenarioUserFunctions = createSpy("User Functions to call before each scenario");
    spyOn(Cucumber.Types, 'Collection').andReturn(beforeEachScenarioUserFunctions);
    listener = Cucumber.Listener.ProgressFormatter();
  });

  describe("constructor", function() {
    it("creates a new collection to store user functions to call before each scenario", function() {
      expect(Cucumber.Types.Collection).toHaveBeenCalled();
    });
  });

  describe("beforeEachScenarioDo()", function() {
    beforeEach(function() {
      spyOnStub(beforeEachScenarioUserFunctions, 'add');
    });

    it("adds the user function to the collection of 'before each scenario' user functions", function() {
      var userFunction = createSpy("A user function to call before each scenario");
      listener.beforeEachScenarioDo(userFunction);
      expect(beforeEachScenarioUserFunctions.add).toHaveBeenCalledWith(userFunction);
    });
  });

  describe("log()", function() {
    it("records logged strings", function() {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      listener.log(logged);
      listener.log(alsoLogged);
      expect(listener.getLogs()).toBe(loggedBuffer);
    });
  });

  describe("getLogs()", function() {
    it("returns the logged buffer", function() {
      var logged       = "this was logged";
      var alsoLogged   = "this was also logged";
      var loggedBuffer = logged + alsoLogged;
      listener.log(logged);
      listener.log(alsoLogged);
      expect(listener.getLogs()).toBe(loggedBuffer);
    });

    it("returns an empty string when the listener did not log anything yet", function() {
      expect(listener.getLogs()).toBe("");
    });
  });

  describe("hearStepResult", function() {
    var stepResult;

    beforeEach(function() {
      spyOn(listener, 'log');
      stepResult = createSpy("AST step result");
    });

    describe("when the step has passed", function() {
      it("logs the passing step character if the step succeeded", function() {
	listener.hearStepResult(stepResult);
	expect(listener.log).toHaveBeenCalledWith(Cucumber.Listener.ProgressFormatter.PASSING_STEP_CHARACTER);
      });
    });
  });

  describe("hearAfterFeatures()", function() {
    var features;

    beforeEach(function() {
      features = createSpy("Features AST element");
      spyOn(listener, "logSummary");
    });

    it("displays a summary", function() {
      listener.hearAfterFeatures(features);
      expect(listener.logSummary).toHaveBeenCalled();
    });
  });
});
