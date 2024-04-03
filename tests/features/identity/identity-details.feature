Feature: Identity Details

  Background:
    Given user is onboarded with skipped password creation

  Scenario Outline: Identity Details - Done button on card details screen of <key_name> identifier works correctly
    Given user add <key_name> identity through plus icon
    Then user can see toast message about created identity on Identity screen
    And user can see identity card details
    When user chose newly created identity on Identity screen
    And user can see Card Details screen for <key_name>
    And tap Done button on Card Details screen
    Then user can see Identity screen with 1 card
    Examples:
      | key_name |
      | DIDKEY   |
      | KERI     |


  Scenario Outline: Identity Details - User can copy card details of <key_name> identifier
    Given identifier is created and user can see Card Details screen for <key_name>
    Then user copy and verify details for <key_name>
    Examples:
      | key_name |
      | DIDKEY   |
      | KERI     |
