Feature: Identity Share

  Background:
    Given user is onboarded with skipped password creation
    And identifier is created and user can see Card Details screen for KERI

  Scenario: Identity Share - Copy identifier
    Given user tap Share button on Card Details screen
    When user see Share Identifier modal
    And user tap Copy Identifier icon on Share identifier modal
    Then user can see toast message about copied value to clipboard
   # And value is copied to system clipboard

  Scenario: Identity Share - More share options
    Given user tap Share button on Card Details screen
    When user see Share Identifier modal
    Then user tap More Share Options icon on Share identifier modal

  Scenario: Identity Share - Share identifier from Identifier options
    Given user tap Options button on Card Details screen
    Then user tap Share Identifier icon on Share identifier modal
