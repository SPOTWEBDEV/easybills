<?php

namespace App\Core;

class Validator
{
    private array $errors = [];

    public static function make(): self
    {
        return new self();
    }

    public function required(array $data, array $fields): self
    {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || $data[$field] === '' || $data[$field] === null) {
                $this->errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required.';
            }
        }
        return $this;
    }

    public function email(array $data, string $field): self
    {
        if (isset($data[$field]) && !filter_var($data[$field], FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Enter a valid email address.';
        }
        return $this;
    }

    public function minLength(array $data, string $field, int $length): self
    {
        if (isset($data[$field]) && strlen((string) $data[$field]) < $length) {
            $this->errors[$field] = ucfirst($field) . " must be at least {$length} characters.";
        }
        return $this;
    }

    public function numeric(array $data, string $field): self
    {
        if (isset($data[$field]) && !is_numeric($data[$field])) {
            $this->errors[$field] = ucfirst($field) . ' must be a number.';
        }
        return $this;
    }

    public function min(array $data, string $field, float $min): self
    {
        if (isset($data[$field]) && is_numeric($data[$field]) && (float) $data[$field] < $min) {
            $this->errors[$field] = ucfirst($field) . " must be at least {$min}.";
        }
        return $this;
    }

    public function regex(array $data, string $field, string $pattern, string $message): self
    {
        if (isset($data[$field]) && !preg_match($pattern, (string) $data[$field])) {
            $this->errors[$field] = $message;
        }
        return $this;
    }

    public function fails(): bool
    {
        return count($this->errors) > 0;
    }

    public function errors(): array
    {
        return $this->errors;
    }

    public function firstError(): ?string
    {
        return array_values($this->errors)[0] ?? null;
    }
}
