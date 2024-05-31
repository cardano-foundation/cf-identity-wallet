Feature: Identity Delete

  Background:
    Given user is onboarded with skipped password creation

  Scenario: Identity Delete - KERI default identifier removed by details screen
    Given user add KERI identity through plus icon
    When user chose newly created identity on Identity screen
    And tap Delete identifier button on Card Details screen
    And tap Confirm button on alert modal on Identifier Card Details screen
    And user enter passcode on Verify Passcode screen
    Then user can see toast message about deleted identity on Identity screen
    And user can see Add An Identifier button on Identity screen

  Scenario: Identity Delete - KERI default identifier removed by options
    Given user add KERI identity through plus icon
    When user chose newly created identity on Identity screen
    And user tap Options button on Card Details screen
    And tap Delete identifier option from Identity Options modal
    And tap Confirm button on alert modal on Identifier Card Details screen
    And user enter passcode on Verify Passcode screen
    Then user can see toast message about deleted identity on Identity screen
    And user can see Add An Identifier button on Identity screen
