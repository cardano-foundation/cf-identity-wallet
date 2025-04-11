Feature: Menu setting passcode change

  Background:
    Given user is onboarded with skipped password creation
    And user tap Menu button on Tab bar
    And user tap Settings button on Menu screen
    And user tap on Manage Operation Password button on Menu screen

  Scenario: C404 MenuSettingsManagePassword - Back to Menu Settings screen
    Given user tap on Back Button on Manage Password screen
    Then user can see Menu screen

  Scenario: C405 MenuSettingsManagePassword - Cancel on Operations Password modal
    Given user tap on Operation Password button on Manage Password screen
    When user tap Cancel button on alert modal for Manage Password screen
    Then user can see Manage Password screen

  Scenario: C406 MenuSettingsManagePassword - Continue on Operations Password modal
    Given user enter passcode on Verify Passcode screen
    When user enter a generated passcode on Passcode screen
    And user tap Cancel button on Passcode screen from Setting screen
    Then user can see Create new passcode screen from Menu screen

  Scenario: C407 MenuSettingsManagePassword - Disable operations password
    Given user enter passcode on Verify Passcode screen
    When user enter a generated passcode on Passcode screen
    And user tap Can't remember button on Re-enter your Passcode screen from Menu screen
    Then user can see Create new passcode screen from Menu screen

  Scenario: C408 MenuSettingsManagePassword - Enable operations password during onboarding
    Given user enter passcode on Verify Passcode screen
    When user generate passcode on Passcode screen
    Then user can see toast message about change password successfully
    And user can see Menu screen

  Scenario: C409 MenuSettingsManagePassword - Enable operations password after onboarding
    Given user enter passcode on Verify Passcode screen
    When user generate passcode on Passcode screen
    Then user can see toast message about change password successfully
    And user can see Menu screen