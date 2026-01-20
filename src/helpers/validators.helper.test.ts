import { describe, it, expect } from 'vitest';
import { validators, createValidator } from './validators.helper';

describe('validators.helper', () => {
  describe('required', () => {
    it('returns error when empty', () => {
      expect(validators.required('')).toBe('Campo obrigatório');
      expect(validators.required('   ')).toBe('Campo obrigatório');
    });
    it('returns empty when has content', () => {
      expect(validators.required('abc')).toBe('');
    });
  });

  describe('name', () => {
    it('requires value', () => {
      expect(validators.name('')).toBe('Campo obrigatório');
    });
    it('enforces min length 3', () => {
      expect(validators.name('Jo')).toBe('Deve ter no mínimo 3 caracteres');
    });
    it('enforces max length 100', () => {
      expect(validators.name('a'.repeat(101))).toBe('Deve ter no máximo 100 caracteres');
    });
    it('accepts valid name', () => {
      expect(validators.name('John Doe')).toBe('');
    });
  });

  describe('email', () => {
    it('requires value', () => {
      expect(validators.email('')).toBe('Campo obrigatório');
    });
    it('rejects invalid email formats', () => {
      expect(validators.email('plainaddress')).toBe('Email inválido');
      expect(validators.email('user@example')).toBe('Email inválido');
      expect(validators.email('.user@example.com')).toBe('Email inválido');
      expect(validators.email('user..doubledot@example.com')).toBe('Email inválido');
    });
    it('accepts valid email', () => {
      expect(validators.email('user+tag@example.co.uk')).toBe('');
    });
  });

  describe('password', () => {
    it('requires value', () => {
      expect(validators.password('')).toBe('Campo obrigatório');
    });
    it('enforces min length 5', () => {
      expect(validators.password('1234')).toBe('Deve ter no mínimo 5 caracteres');
    });
    it('accepts valid password', () => {
      expect(validators.password('12345')).toBe('');
    });
  });

  describe('cpf', () => {
    it('requires value', () => {
      expect(validators.cpf('')).toBe('Campo obrigatório');
    });
    it('rejects wrong length', () => {
      expect(validators.cpf('1234567890')).toBe('CPF deve conter 11 dígitos');
    });
    it('rejects repeated digits', () => {
      expect(validators.cpf('111.111.111-11')).toBe('CPF inválido');
    });
    it('accepts a valid CPF (with/without formatting)', () => {
      // Known valid CPF sample
      expect(validators.cpf('529.982.247-25')).toBe('');
      expect(validators.cpf('52998224725')).toBe('');
    });
  });

  describe('phone', () => {
    it('requires value', () => {
      expect(validators.phone('')).toBe('Campo obrigatório');
    });
    it('rejects invalid lengths', () => {
      expect(validators.phone('99999-1234')).toBe('Telefone inválido'); // 9 digits
    });
    it('accepts 10 or 11 digits after cleaning', () => {
      expect(validators.phone('11 9999-1234')).toBe(''); // 10 digits
      expect(validators.phone('(11) 99999-1234')).toBe(''); // 11 digits
    });
  });

  describe('age', () => {
    it('requires value', () => {
      expect(validators.age('')).toBe('Campo obrigatório');
    });
    it('rejects non-numeric', () => {
      expect(validators.age('abc')).toBe('Deve conter apenas números');
    });
    it('rejects negative numbers (non-digit)', () => {
      // The digits-only rule blocks negatives before min check
      expect(validators.age('-1')).toBe('Deve conter apenas números');
    });
    it('accepts 0 or greater', () => {
      expect(validators.age('0')).toBe('');
      expect(validators.age('12')).toBe('');
    });
  });

  describe('minLength/maxLength direct usage', () => {
    it('minLength returns error below threshold', () => {
      const min3 = validators.minLength(3);
      expect(min3('ab')).toBe('Deve ter no mínimo 3 caracteres');
      expect(min3('abc')).toBe('');
    });
    it('maxLength returns error above threshold', () => {
      const max5 = validators.maxLength(5);
      expect(max5('abcdef')).toBe('Deve ter no máximo 5 caracteres');
      expect(max5('abcde')).toBe('');
    });
  });

  describe('createValidator', () => {
    it('short-circuits on first error', () => {
      const rule = createValidator(validators.minLength(3), validators.maxLength(5));
      expect(rule('ab')).toBe('Deve ter no mínimo 3 caracteres');
      expect(rule('abcdef')).toBe('Deve ter no máximo 5 caracteres');
    });
    it('passes when all rules pass', () => {
      const rule = createValidator(validators.minLength(2), validators.maxLength(4));
      expect(rule('abc')).toBe('');
    });
  });
});
