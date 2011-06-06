Feature: Progress formatter
  In order to have concise information about the execution of my features
  As a cucumber user
  I want a so-called "progress" formatter

  Scenario: Running a one-scenario feature
    Given a step definition matching /^a step passes$/
    When I run the following feature with the "progress" formatter:
      """
      Feature: Progress formatter on one-scenario feature
        Scenario: A few passing steps
          When a step passes
          Then a step passes
      """
    Then the listener should output the following:
      """
      ..
      
      1 scenario (1 passed)
      2 steps (2 passed)
      """
