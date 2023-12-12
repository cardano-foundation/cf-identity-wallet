Feature: VerifySeedPhrase

  Background:
    Given user tap Get Started button on Onboarding screen
    And user generate passcode on Passcode screen
    And skip Create Password screen


  Scenario: VerifySeedPhrase - user can go back to Generate Seed Phrase screen
    Given user continue after choose and save 15 words seed phrase
    When user tap Back arrow icon on the screen
    Then user can see Generate Seed Phrase screen

  Scenario: VerifySeedPhrase - user can verify 15 words seed phrase
    Given user continue after choose and save 15 words seed phrase
    When user select words from his seed phrase on Verify Seed Phrase screen
    And user tap Continue button on Verify Seed Phrase screen
    Then user can see Identity screen

