Feature: SeedPhraseVerify

  Background:
    Given user tap Get Started button on Onboarding screen
    And user generate passcode on Passcode screen
    And skip Create Password screen


  Scenario: SeedPhraseVerify - user can go back to Seed Phrase Generate screen
    Given user continue after choose and save 15 words seed phrase
    When user tap Back arrow icon on Seed Phrase Verify screen
    Then user can see Seed Phrase Generate screen

  Scenario: SeedPhraseVerify - user can verify 15 words seed phrase
    Given user continue after choose and save 15 words seed phrase
    When user select words from his seed phrase on Seed Phrase Verify screen
    And user tap Continue button on Seed Phrase Verify screen
    And user add name on Welcome modal
    Then user can see Identity screen
