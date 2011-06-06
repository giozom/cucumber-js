if (typeof(require) == 'function') {
  var Gherkin = require('gherkin');
};

var Cucumber = function(featuresSource, supportCodeDefinition) {
  var listeners = Cucumber.Types.Collection();

  var self = {
    start: function start(callback) {
      if (typeof(callback) !== 'function')
        throw Cucumber.START_MISSING_CALLBACK_ERROR;
      var features           = self.parseFeaturesSource(featuresSource);
      var supportCodeLibrary = self.initializeSupportCode(supportCodeDefinition);
      self.executeFeaturesAgainstSupportCodeLibrary(features, supportCodeLibrary, callback);
    },

    attachListener: function attachListener(listener) {
      listeners.add(listener);
    },

    parseFeaturesSource: function parseFeaturesSource(featuresSource) {
      var parser = Cucumber.Parser(featuresSource);
      return parser.parse();
    },

    initializeSupportCode: function initializeSupportCode(supportCodeDefinition) {
      var supportCodeLibrary = Cucumber.SupportCode.Library(supportCodeDefinition);
      return supportCodeLibrary;
    },

    executeFeaturesAgainstSupportCodeLibrary: function executeFeaturesAgainstSupportCodeLibrary(features, supportCodeLibrary, callback) {
      var treeWalker = Cucumber.Ast.TreeWalker(features, supportCodeLibrary, listeners);
      treeWalker.walk(callback);
    }
  };
  return self;
};

Cucumber.START_MISSING_CALLBACK_ERROR = "Cucumber.start() expects a callback.";

Cucumber.Parser = function(featuresSource) {
  var features = Cucumber.Ast.Features();
  var self = {
    parse: function parse() {
      var Lexer = Gherkin.Lexer('en');
      var lexer = new Lexer(self.getEventHandlers());
      lexer.scan(featuresSource);
      return features;
    },

    getEventHandlers: function getEventHandlers() {
      return {
        feature:    self.handleFeature,
        scenario:   self.handleScenario,
        step:       self.handleStep,
        doc_string: self.handleDocString,
        eof:        self.handleEof
      };
    },

    getCurrentFeature: function getCurrentFeature() {
      return features.getLastFeature();
    },

    getCurrentScenario: function getCurrentScenario() {
      var currentFeature = self.getCurrentFeature();
      return currentFeature.getLastScenario();
    },

    getCurrentStep: function getCurrentStep() {
      var currentScenario = self.getCurrentScenario();
      return currentScenario.getLastStep();
    },

    handleFeature: function handleFeature(keyword, name, description, line) {
      var feature = Cucumber.Ast.Feature(keyword, name, description, line);
      features.addFeature(feature);
    },

    handleScenario: function handleScenario(keyword, name, description, line) {
      var scenario       = Cucumber.Ast.Scenario(keyword, name, description, line);
      var currentFeature = self.getCurrentFeature();
      currentFeature.addScenario(scenario);
    },

    handleStep: function handleStep(keyword, name, line) {
      var step            = Cucumber.Ast.Step(keyword, name, line);
      var currentScenario = self.getCurrentScenario();
      currentScenario.addStep(step);
    },

    handleDocString: function handleDocString(string, line) {
      var docString   = Cucumber.Ast.DocString(string, line);
      var currentStep = self.getCurrentStep();
      currentStep.attachDocString(docString);
    },

    handleEof: function handleEof() {}
  };
  return self;
};

Cucumber.Ast = {};

Cucumber.Ast.Features = function() {
  var features = Cucumber.Types.Collection();

  var self = {
    addFeature: function addFeature(feature) {
      features.add(feature);
    },

    getLastFeature: function getLastFeature() {
      return features.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      features.forEach(function(feature, iterate) {
        visitor.visitFeature(feature, iterate);
      }, callback);
    }
  };
  return self;
};

Cucumber.Ast.Feature = function(keyword, name, description, line) {
  var scenarios = Cucumber.Types.Collection();

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    getDescription: function getDescription() {
      return description;
    },

    addScenario: function addScenario(scenario) {
      scenarios.add(scenario);
    },

    getLastScenario: function getLastScenario() {
      return scenarios.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      scenarios.forEach(function(scenario, iterate) {
        visitor.visitScenario(scenario, iterate);
      }, callback);
    }
  };
  return self;
};

Cucumber.Ast.Scenario = function(keyword, name) {
  var steps = Cucumber.Types.Collection();

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    addStep: function addStep(step) {
      steps.add(step);
    },

    getLastStep: function getLastStep() {
      return steps.getLast();
    },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      steps.forEach(function(step, iterate) {
        visitor.visitStep(step, iterate);
      }, callback);
    }
  };
  return self;
};

Cucumber.Ast.Step = function(keyword, name, line) {
  var docString;

  var self = {
    getKeyword: function getKeyword() {
      return keyword;
    },

    getName: function getName() {
      return name;
    },

    hasDocString: function hasDocString() {
      return !!docString;
    },

    getDocString: function getDocString() { return docString; },

    attachDocString: function attachDocString(_docString) { docString = _docString; },

    acceptVisitor: function acceptVisitor(visitor, callback) {
      self.execute(visitor, function(stepResult) {
        visitor.visitStepResult(stepResult, callback);
      });
    },

    execute: function execute(visitor, callback) {
      var stepDefinition = visitor.lookupStepDefinitionByName(name);
      stepDefinition.invoke(name, docString, callback);
    }
  };
  return self;
};

Cucumber.Ast.DocString = function(string, line) {
  var self = {
    getString: function getString() {
      return string;
    }
  };
  return self;
};

Cucumber.Ast.TreeWalker = function(features, supportCodeLibrary, listeners) {
  var listeners;

  var self = {
    walk: function walk(callback) {
      self.visitFeatures(features, callback);
    },

    visitFeatures: function visitFeatures(features, callback) {
      self.broadcastMessagesAroundUserFunction(
        Cucumber.Ast.TreeWalker.FEATURES_MESSAGE,
        function(callback) { features.acceptVisitor(self, callback); },
        callback
      );
    },

    visitFeature: function visitFeature(feature, callback) {
      self.broadcastMessagesAroundUserFunction(
        Cucumber.Ast.TreeWalker.FEATURE_MESSAGE,
        feature,
        function(callback) { feature.acceptVisitor(self, callback); },
        callback
      );
    },

    visitScenario: function visitScenario(scenario, callback) {
      self.broadcastMessagesAroundUserFunction(
        Cucumber.Ast.TreeWalker.SCENARIO_MESSAGE,
        scenario,
        function(callback) { scenario.acceptVisitor(self, callback); },
        callback
      );
    },

    visitStep: function visitStep(step, callback) {
      self.broadcastMessagesAroundUserFunction(
        Cucumber.Ast.TreeWalker.STEP_MESSAGE,
        step,
        function(callback) { step.acceptVisitor(self, callback); },
        callback
      );
    },

    visitStepResult: function visitStepResult(stepResult, callback) {
      self.broadcastMessage(
        Cucumber.Ast.TreeWalker.STEP_RESULT_MESSAGE,
        stepResult,
        callback
      );
    },

    broadcastMessagesAroundUserFunction: function broadcastMessagesAroundUserFunction() {
      var message          = arguments[0];
      var parameters       = [];
      if (arguments.length > 2) {
        for(var i = 1; i < arguments.length - 1; i++) {
          parameters.push(arguments[i]);
        };
      };
      var userFunction     = arguments[arguments.length - 1];
      var beforeMessage    = Cucumber.Ast.TreeWalker.BEFORE_MESSAGE_PREFIX + message;
      var afterMessage     = Cucumber.Ast.TreeWalker.AFTER_MESSAGE_PREFIX  + message;
      var beforeParameters = [beforeMessage].concat(parameters);
      var afterParameters  = [afterMessage].concat(parameters);

      self.broadcastMessage.apply(this, beforeParameters);
      userFunction();
      self.broadcastMessage.apply(this, [afterMessage].concat(parameters));
    },

    broadcastMessage: function broadcastMessage() {
      var message    = arguments[0];
      var parameters = [];
      for(var i = 1; i < arguments.length; i++) {
        parameters.push(arguments[i]);
      };
      listeners.syncForEach(function(listener) {
        var hearMethodName = Cucumber.Ast.TreeWalker.HEAR_METHOD_PREFIX + message;
        listener[hearMethodName].apply(this, parameters);
      });
    },

    lookupStepDefinitionByName: function lookupStepDefinitionByName(stepName) {
      return supportCodeLibrary.lookupStepDefinitionByName(stepName);
    }
  };
  return self;
};

Cucumber.Ast.TreeWalker.FEATURES_MESSAGE      = 'Features';
Cucumber.Ast.TreeWalker.FEATURE_MESSAGE       = 'Feature';
Cucumber.Ast.TreeWalker.SCENARIO_MESSAGE      = 'Scenario';
Cucumber.Ast.TreeWalker.STEP_MESSAGE          = 'Step';
Cucumber.Ast.TreeWalker.STEP_RESULT_MESSAGE   = 'StepResult';
Cucumber.Ast.TreeWalker.BEFORE_MESSAGE_PREFIX = 'Before';
Cucumber.Ast.TreeWalker.AFTER_MESSAGE_PREFIX  = 'After';
Cucumber.Ast.TreeWalker.HEAR_METHOD_PREFIX    = 'hear';

Cucumber.SupportCode = {};

Cucumber.SupportCode.Library = function(supportCodeDefinition) {
  var stepDefinitions = Cucumber.Types.Collection();

  var self = {
    lookupStepDefinitionByName: function lookupStepDefinitionByName(name) {
      var matchingStepDefinition;

      stepDefinitions.syncForEach(function(stepDefinition) {
        if (stepDefinition.matchesStepName(name)) {
          matchingStepDefinition = stepDefinition;
        }
      });
      return matchingStepDefinition;
    },

    defineGivenStep: function defineGivenStep(name, code) {
      defineStep(name, code);
    },

    defineWhenStep: function defineWhenStep(name, code) {
      defineStep(name, code);
    },

    defineThenStep: function defineThenStep(name, code) {
      defineStep(name, code);
    }
  };

  withStepDefinitionHelpersDo(function() {
    supportCodeDefinition();
  });

  function withStepDefinitionHelpersDo(callback) {
    var originals = {
      Given: (typeof(Given) != 'undefined' ? Given : undefined),
      When:  (typeof(When)  != 'undefined' ? When  : undefined),
      Then:  (typeof(Then)  != 'undefined' ? Then  : undefined)
    };
    Given = self.defineGivenStep;
    When  = self.defineWhenStep;
    Then  = self.defineThenStep;
    callback();
    Given = originals['Given'];
    When  = originals['When'];
    Then  = originals['Then'];
  };

  function defineStep(name, code) {
    var stepDefinition = Cucumber.SupportCode.StepDefinition(name, code);
    stepDefinitions.add(stepDefinition);
  };

  return self;
};

Cucumber.SupportCode.StepDefinition = function(regexp, code) {
  var self = {
    matchesStepName: function matchesStepName(stepName) {
      return regexp.test(stepName);
    },

    invoke: function invoke(stepName, docString, callback) {
      var parameters = self.buildInvocationParameters(stepName, docString, function() {
        var stepResult = Cucumber.Runtime.StepResult(true);
        callback(stepResult);
      });
      code.apply(undefined, parameters);
    },

    buildInvocationParameters: function buildInvocationParameters(stepName, docString, callback) {
      var parameters = regexp.exec(stepName);
      parameters.shift();
      if (docString) {
        var string = docString.getString();
        parameters.push(string);
      }
      parameters.push(callback);
      return parameters;
    }
  };
  return self;
};

Cucumber.Runtime = {};

Cucumber.Runtime.StepResult = function(status) {
  var self = {
    isSuccessful: function isSuccessful() {
      return !!status;
    }
  };
  return self;
};

Cucumber.Types = {};
Cucumber.Types.Collection = function() {
  var items = new Array();
  var self = {
    add:         function add(item)                       { items.push(item); },
    getLast:     function getLast()                       { return items[items.length-1]; },
    syncForEach: function syncForEach(userFunction)       { items.forEach(userFunction); },
    forEach:     function forEach(userFunction, callback) {
      var itemsCopy = items.slice(0);
      function iterate() {
        if (itemsCopy.length > 0) {
          processItem();
        } else {
          callback();
        };
      }
      function processItem() {
        var item = itemsCopy.shift();
        userFunction(item, function() {
          iterate();
        });
      };
      iterate();
    }
  };
  return self;
};

/*
  Cucumber.Debug utilities are meant to experiment and...
  debug. No tests cover that namespace.
*/
Cucumber.Debug = {};
Cucumber.Debug.SimpleAstListener = function(options) {
  var logs                        = '';
  var failed                      = false;
  var beforeEachScenarioCallbacks = [];
  var currentStep;

  if (!options)
    var options = {};

  var self = {
    hearBeforeFeatures: function hearBeforeFeatures() { },

    hearAfterFeatures: function hearAfterFeatures() { },

    hearBeforeFeature: function hearBeforeFeature(feature) {
      log("Feature: " + feature.getName());
      var description = feature.getDescription();
      if (description != "")
        log(description, 1);
    },

    hearAfterFeature: function hearAfterFeature() { },

    hearBeforeScenario: function hearBeforeScenario(scenario) {
      beforeEachScenarioCallbacks.forEach(function(func) {
        func();
      });
      log("");
      log(scenario.getKeyword() + ": " + scenario.getName(), 1);
    },

    hearAfterScenario: function hearAfterScenario() { },

    hearBeforeStep: function hearBeforeStep(step) {
      currentStep = step;
    },

    hearStepResult: function hearStepResult(stepResult) {
      log(currentStep.getKeyword() + currentStep.getName(), 2);
      if (currentStep.hasDocString()) {
        log('"""', 3);
        log(currentStep.getDocString().getString(), 3);
        log('"""', 3);
      };
    },

    hearAfterStep: function hearAfterStep() {
    },

    getLogs: function getLogs() {
      return logs;
    },

    featuresPassed: function featuresPassed() {
      return !failed;
    },

    beforeEachScenarioDo: function beforeEachScenarioDo(func) {
      beforeEachScenarioCallbacks.push(func);
    }
  };
  return self;

  function log(message, indentation) {
    if (indentation)
      message = indent(message, indentation);
    logs = logs + message + "\n";
    if (options['logToConsole'])
      console.log(message);
    if (typeof(options['logToFunction']) == 'function')
      options['logToFunction'](message);
  };

  function indent(text, indentation) {
    var indented;
    text.split("\n").forEach(function(line) {
      var prefix = new Array(indentation + 1).join("  ");
      line = prefix + line;
      indented = (typeof(indented) == 'undefined' ? line : indented + "\n" + line);
    });
    return indented;
  };
};
Cucumber.Debug.SgmlAstListener = function() {
  var self = {
    hearBeforeFeatures: function hearBeforeFeatures() {
      console.log("<features>");
    },

    hearAfterFeatures: function hearAfterFeatures() {
      console.log("</features>");
    },

    hearBeforeFeature: function hearBeforeFeature() {
      console.log("  <feature>");
    },

    hearAfterFeature: function hearAfterFeature() {
      console.log("  </feature>");
    },

    hearBeforeScenario: function hearBeforeScenario() {
      console.log("    <scenario>");
    },

    hearAfterScenario: function hearAfterScenario() {
      console.log("    </scenario>");
    },

    hearBeforeStep: function hearBeforeStep() {
      console.log("      <step>");
    },

    hearStepResult: function hearStepResult(stepResult) {
      console.log("        <result success='" + (stepResult.isSuccessful() ? "true" : "false") + "'></result>");
    },

    hearAfterStep: function hearAfterStep() {
      console.log("      </step>");
    }
  };
  return self;
};

if(typeof exports != 'undefined') { module.exports = Cucumber; }
if(typeof window != 'undefined') { for (var p in Cucumber) { window[p] = Cucumber[p]; } }

var TODO = function(description) {
  return function() { throw("IMPLEMENT ME: "+description) };
};
