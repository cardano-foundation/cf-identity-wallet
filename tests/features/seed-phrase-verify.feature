Feature: SeedPhraseVerify

  Background:
    Given user tap Get Started button on Onboarding screen
    And user generate passcode on Passcode screen
    And skip Create Password screen


  Scenario: SeedPhraseVerify - user can go back to Seed Phrase Generate screen
    Given user continue after choose and save words of recovery phrase
    When user tap Back button on Seed Phrase Verify screen
    Then user can see Seed Phrase Generate screen

  Scenario: SeedPhraseVerify - user can verify words of seed phrase
    Given user continue after choose and save words of recovery phrase
    When user select words from his seed phrase on Seed Phrase Verify screen
    And user tap Continue button on Seed Phrase Verify screen
    Then user can see SSI Agent Details screen
