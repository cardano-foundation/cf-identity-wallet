#Feature: Identity Edit
#
#  Background:
#    Given user is onboarded with skipped password creation
#
#  Scenario Outline: Identity Edit - User can cancel edit for <key_name> identifier
#    Given identifier is created and user can see Card Details screen for <key_name>
#    When user tap Options button on Card Details screen
#    And user tap Edit identifier option from Identity Options modal
#    And user modify display name on Edit Identifier modal
#    And user tap Cancel button on modal
#    Then user can see Card Details screen for <key_name>
#    Then user can see toast
#    And new display name
#    # Then user can see toast message about copied value to clipboard
#    Examples:
#      | key_name | json_name  |
#      | DIDKEY   | DidKeyJson |
#      | KERI     | KeriJson   |

#  Scenario Outline: Identity Edit - User can edit display name for <key_name> identifier
#    Given identifier is created and user can see Card Details screen for <key_name>
#    When user tap Options button on Card Details screen
#    And user tap Edit identifier option from Identity Options modal
#    And user modify display name on Edit Identifier modal
#    And user tap Save button on Edit Identifier modal
#    Then user can see toast
#    And user can see Card Details screen for <key_name> with new display name
#    Examples:
#      | key_name |
#      | DIDKEY   |
#      | KERI     |
