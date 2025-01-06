Feature: Menu

  Background:
    Given user is onboarded with skipped password creation

  Scenario: Menu - loads correctly
    Given user tap Menu button on Tab bar
    Then user can see Menu screen