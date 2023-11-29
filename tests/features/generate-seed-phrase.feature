Feature: GenerateSeedPhrase

  Background:
    Given user tap Get Started button on Onboarding screen
      And user generate passcode on Passcode screen

  Scenario: GenerateSeedPhrase - user can review seed phrase again
    Given user choose and save 15 words seed phrase
      And tap agree to the Terms and Conditions checkbox on Generate Seed Phrase screen
    When user tap Continue button Generate Seed Phrase screen
      And tap Cancel button on modal on Generate Seed Phrase screen
    Then user can see 15 words seed phrase list on Generate Seed Phrase screen

  Scenario: GenerateSeedPhrase - user can use 15 words seed phrase to see Verify Seed Phrase screen
    Given user choose and save 15 words seed phrase
      And tap agree to the Terms and Conditions checkbox on Generate Seed Phrase screen
    When user tap Continue button Generate Seed Phrase screen
      And tap Confirm button on modal on Generate Seed Phrase screen
    Then user can see Verify Seed Phrase screen

  Scenario: GenerateSeedPhrase - user can use 24 words seed phrase to see Verify Seed Phrase screen
    Given user choose and save 24 words seed phrase
      And tap agree to the Terms and Conditions checkbox on Generate Seed Phrase screen
    When user tap Continue button Generate Seed Phrase screen
      And tap Confirm button on modal on Generate Seed Phrase screen
    Then user can see Verify Seed Phrase screen
