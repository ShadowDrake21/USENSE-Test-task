import { NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

enum PasswordStrength {
  EASY = 'easy',
  MEDIUM = 'medium',
  STRONG = 'strong',
  EMPTY = 'empty',
}

type passwordRegsType = {
  lettersReg: RegExp;
  symbolsReg: RegExp;
  digitsReg: RegExp;
};
const passwordRegs: passwordRegsType = {
  lettersReg: /[a-zA-Z]/,
  symbolsReg: /[^\w\s]/,
  digitsReg: /\d/,
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ReactiveFormsModule, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  passwordField = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
  ]);

  passwordStrength: PasswordStrength = PasswordStrength.EMPTY;

  private valueChangesSubscription!: Subscription;

  ngOnInit(): void {
    this.valueChangesSubscription = this.passwordField.valueChanges.subscribe(
      (value) => {
        let workingValue = value;
        if (value?.endsWith(' ')) {
          workingValue = value.slice(0, -1);
          this.passwordField.setValue(workingValue, { emitEvent: false });
        }
        this.passwordStrength = this.calculatePasswordStrength(
          workingValue ?? ''
        );
      }
    );
  }

  calculatePasswordStrength(value: string): PasswordStrength {
    if (this.isPasswordStrengthEasy(value)) {
      return PasswordStrength.EASY;
    } else if (this.isPasswordStrengthMedium(value)) {
      return PasswordStrength.MEDIUM;
    } else if (this.isPasswordStrengthStrong(value)) {
      return PasswordStrength.STRONG;
    }
    return PasswordStrength.EMPTY;
  }

  isPasswordStrengthEasy(value: string): boolean {
    const letters: boolean = /^[a-zA-Z]+$/.test(value);
    const digits: boolean = /^\d+$/.test(value);
    const symbols: boolean = /^[^\w\s]+$/.test(value);

    return letters || digits || symbols;
  }

  isPasswordStrengthMedium(value: string): boolean {
    const { lettersReg, symbolsReg, digitsReg } = passwordRegs;

    const lettersSymbols =
      lettersReg.test(value) &&
      symbolsReg.test(value) &&
      !digitsReg.test(value);

    const lettersDigits =
      lettersReg.test(value) &&
      !symbolsReg.test(value) &&
      digitsReg.test(value);

    const digitsSymbols =
      !lettersReg.test(value) &&
      symbolsReg.test(value) &&
      digitsReg.test(value);

    return (
      (lettersSymbols || lettersDigits || digitsSymbols) &&
      !(lettersSymbols && lettersDigits && digitsSymbols)
    );
  }

  isPasswordStrengthStrong(value: string): boolean {
    const { lettersReg, symbolsReg, digitsReg } = passwordRegs;

    return (
      lettersReg.test(value) && symbolsReg.test(value) && digitsReg.test(value)
    );
  }

  ngOnDestroy(): void {
    if (this.valueChangesSubscription) {
      this.valueChangesSubscription.unsubscribe();
    }
  }
}
