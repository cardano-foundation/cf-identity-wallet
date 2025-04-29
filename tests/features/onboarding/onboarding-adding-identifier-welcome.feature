Feature: OnboardingAddingIdentifierWelcome

  Background:
    Given user is onboarded with skipped password creation successful

  Scenario: C2546 Welcome message - is displayed
    Then user can see Welcome message
