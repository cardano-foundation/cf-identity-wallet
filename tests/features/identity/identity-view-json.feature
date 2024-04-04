Feature: Identity View JSON

  Background:
    Given user is onboarded with skipped password creation

  Scenario Outline: Identity View JSON - <key_name> identifier JSON can be copied
    Given identifier is created and user can see Card Details screen for <key_name>
    When user tap Options button on Card Details screen
    And tap View JSON option from Identity Options modal
    And tap Copy JSON button on Identifier JSON modal
    Then user can see toast message about copied value to clipboard
    And the JSON schema is correct for <json_name>
    Examples:
      | key_name | json_name  |
      | DIDKEY   | DidKeyJson |
      | KERI     | KeriJson   |

  Scenario Outline: Identity View JSON - Done button on Identifier JSON modal of <key_name> identifier works correctly
    Given identifier is created and user can see Card Details screen for <key_name>
    When user tap Options button on Card Details screen
    And tap View JSON option from Identity Options modal
    And user tap Done button on Identifier JSON modal
    Then user can see Card Details screen for <key_name>
    Examples:
      | key_name |
      | DIDKEY   |
      | KERI     |
