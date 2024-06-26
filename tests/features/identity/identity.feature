Feature: Identity

  Background:
    Given user is onboarded with skipped password creation

  Scenario: Identity - Cancel adding an identifier from Add an identified button
    Given user tap Add an identified button on the Identity screen
    Then user can see Add An Identifier modal
    When user tap Cancel button on modal
    Then user can see Identity screen
    And user can not to see Add An Identifier modal

  Scenario: Identity - Cancel adding an identifier from plus icon
    Given user tap Plus button on the screen
    Then user can see Add An Identifier modal
    When user tap Cancel button on modal
    Then user can see Identity screen
    And user can not to see Add An Identifier modal

  Scenario: Identity - Create KERI default identifier from Add an identified button
    Given user tap Add an identified button on the Identity screen
    When user add KERI identity
    Then user can see toast message about created identity on Identity screen
    And user can see identity card details

  Scenario: Identity - Create KERI default identifier from plus icon
    Given user tap Plus button on the screen
    When user add KERI identity
    Then user can see toast message about created identity on Identity screen
    And user can see identity card details
