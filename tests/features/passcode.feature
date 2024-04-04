Feature: Passcode

  Background:
    Given user tap Get Started button on Onboarding screen


  Scenario: Passcode - loads correctly
    Then user can see Passcode screen

  Scenario: Passcode - user can go back to Onboarding screen
    Given user tap Back arrow icon on Passcode screen
    Then user can see Onboarding screen

  Scenario: Passcode - user can go back to Passcode screen
    Given user enter a generated passcode on Passcode screen
    And user can see Re-enter your Passcode screen
    When user tap Back arrow icon on the screen
    Then user can see Passcode screen

  Scenario: Passcode - user can start over
    Given user enter a generated passcode on Passcode screen
    And user can see Re-enter your Passcode screen
    When user tap Forgot your passcode button on Passcode screen
    Then user can see Passcode screen

  Scenario: Passcode - user can set a new passcode
    Given user enter a generated passcode on Passcode screen
    When user re-enter passcode on Passcode screen
    Then user can see Create Password screen
