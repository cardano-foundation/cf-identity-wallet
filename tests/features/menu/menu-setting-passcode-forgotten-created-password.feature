Feature: Menu Settings Passcode Forgotten - User can set new passcode when password enabled

<<<<<<< HEAD
    Scenario: C403 MenuSettingsPasscodeForgotten - User can set new passcode when password enabled
        Given user is onboarded with a password creation
        When user navigate to Change Passcode screen on Menu section
        And user successfully confirmed recovery phrase and passcode flow on Verify Your Recovery Phrase screen with password enable
        Then user can see toast message about change password successfully
=======
  Scenario: C403 MenuSettingsPasscodeForgotten - User can set new passcode when password enabled
    Given user is onboarded with a password creation
    When user navigate to Change Passcode screen on Menu section
    And user successfully confirmed recovery phrase and passcode flow on Verify Your Recovery Phrase screen with password enable
    Then user can see toast message about change password successfully
>>>>>>> cdc32f95976a6bff01d651e1641f0d059ad0ea07
