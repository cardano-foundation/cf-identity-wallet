Feature: CreatePassword

  Background:
    Given user tap Get Started button on Onboarding screen
    And user generate passcode on Passcode screen


  Scenario: CreatePassword - user can go back to Onboarding screen
    Given user tap Back arrow icon on the screen
    Then user can see Onboarding screen

  Scenario: CreatePassword - user can cancel skipping password creation
    Given user tap Skip button on Create Password screen
    When tap Cancel button on alert modal
    Then user can see Create Password screen

  Scenario: CreatePassword - user can skip password creation
    Given user tap Skip button on Create Password screen
    When tap Confirm button on alert modal
    Then user can see Generate Seed Phrase screen

  Scenario: CreatePassword - user can set password successfully with all conditions
    Given user generated a password of 10 characters
    And user type in password on Create Password screen
    And user confirm type in password on Create Password screen
    And all conditions are displayed as passed on Create Password screen
    When user tap Create Password button on Create Password screen
    Then user can see Generate Seed Phrase screen

  Scenario Outline: CreatePassword - user can set <name> password length
    Given user generated a password of <length> characters
    And user type in password on Create Password screen
    And user confirm type in password on Create Password screen
    When user tap Create Password button on Create Password screen
    Then user can see Generate Seed Phrase screen
    Examples:
      | name    | length |
      | maximum | 64     |
      | minimum | 8      |

  Scenario: CreatePassword - user can set password with hint
    Given user generated a password of 10 characters
    And user type in password on Create Password screen
    And user confirm type in password on Create Password screen
    And user type in hint for the password on Create Password screen
    When user tap Create Password button on Create Password screen
    Then user can see Generate Seed Phrase screen

  Scenario Outline: CreatePassword - validation for <name>
    Given user type in password <password> on Create Password screen
    Then user can see <errorMessage> on Create Password screen
    And icon for <name> is displayed as failed on Create Password screen
    Examples:
      | name                          | password                                                          | errorMessage                         |
      | too long password             | 1234567asdwer@#$3FSvcvxzvxvfas4af4afavbns2adfasfs4wfsagsfssfewfa2 | Must be less than 64 characters long |
      | too short password            | 1234567                                                           | Must be more than 8 characters long  |
      | lack of uppercase in password | !a345678                                                          | Must contain an uppercase letter     |
      | lack of lowercase in password | !A345678                                                          | Must contain a lowercase letter      |
      | lack of symbol in password    | 12345678Qw                                                        | Must contain a valid symbol          |
      | lack of number in password    | !Aasdfgq                                                          | Must contain a number                |
