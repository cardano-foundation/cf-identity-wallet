Feature: OnboardingAddingIdentifierWelcome

  Background:
    Given user is onboarded with skipped password creation successful

  Scenario: C2546 Welcome message - is displayed
    Then user can see Welcome message

  Scenario: C2547 Welcome message - Add an identifier is successful
    Given user tap Add and Identifier button on Welcome message
    When user add Individual identifier
    Then user can see toast message about created identifier
    And user can see Identifiers screen with 1 card