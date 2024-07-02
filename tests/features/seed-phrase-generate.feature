Feature: SeedPhraseGenerate

  Background:
    Given user tap Get Started button on Onboarding screen
    And user generate passcode on Passcode screen
    And skip Create Password screen


  Scenario: SeedPhraseGenerate - user can go back to Create Password screen
    Given user tap Back arrow icon on Seed Phrase Generate screen
    Then user can see Create Password screen

  Scenario: SeedPhraseGenerate - user can read Terms of Use
    Given user tap Terms of Use link on Seed Phrase Generate screen
    Then user can see Terms of Use modal
    When user tap Done button on modal
    Then user can see Seed Phrase Generate screen

  Scenario: SeedPhraseGenerate - user can read Privacy Policy
    Given user tap Privacy Policy link on Seed Phrase Generate screen
    Then user can see Privacy Policy modal
    When user tap Done button on modal
    Then user can see Seed Phrase Generate screen

  Scenario: SeedPhraseGenerate - user can go to see Verify Seed Phrase screen
    Given user tap View Seed Phrase button on Seed Phrase Generate screen
    And tap agree to the Terms and Conditions checkbox on Seed Phrase Generate screen
    When user tap Continue button Seed Phrase Generate screen
    And tap Confirm button on alert modal for Seed Phrase Generate screen
    Then user can see Seed Phrase Verify screen
