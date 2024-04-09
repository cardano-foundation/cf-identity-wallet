Feature: Identity Delete

  Background:
    Given user is onboarded with skipped password creation

  Scenario Outline: Identity Delete - <key_name> identifier removed by details screen
    Given user add <key_name> identity through plus icon
    When user chose newly created identity on Identity screen
    And tap Delete identifier button on Card Details screen
    And tap Confirm button on alert modal on Identifier Card Details screen
    And user enter passcode on Verify Passcode screen
    Then user can see toast message about deleted identity on Identity screen
    And user can see Add An Identifier button on Identity screen
    Examples:
      | key_name |
      | DIDKEY   |
      | KERI     |

  Scenario Outline: Identity Delete - <key_name> identifier removed by options
    Given user add <key_name> identity through plus icon
    When user chose newly created identity on Identity screen
    And user tap Options button on Card Details screen
    And tap Delete identifier option from Identity Options modal
    And tap Confirm button on alert modal for Identifier Options modal
    And user enter passcode on Verify Passcode screen
    Then user can see toast message about deleted identity on Identity screen
    And user can see Add An Identifier button on Identity screen
    Examples:
      | key_name |
      | DIDKEY   |
      | KERI     |
