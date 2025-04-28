Feature: HandleBiometric

  Background:
    Given user tap Get Started button on Onboarding screen
    And user generate passcode on Passcode screen

  Scenario: TC01 HandleBiometric - user click on Don't allow button
    Given user can see Biometric popup
    When user tap Don't allow button
    Then Canceled Biometric popup is displayed
    When user tap OK button
    Then Biometric popup is closed