Feature: Menu

  Background:
    Given user is onboarded with skipped password creation

  Scenario: Menu - loads correctly
    Given user tap Menu button on Tab bar
    Then user can see Menu screen

  Scenario: Menu Settings - loads correctly
    Given user tap Menu button on Tab bar
    When user tap Settings button on Menu screen
    Then user can see Menu Settings screen
