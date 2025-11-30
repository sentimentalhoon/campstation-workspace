package com.campstation.camp.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Field;
import java.time.LocalDate;

/**
 * Validator for date range
 * Ensures check-out date is after check-in date
 */
@Slf4j
public class DateRangeValidator implements ConstraintValidator<ValidDateRange, Object> {

    private String checkInField;
    private String checkOutField;

    @Override
    public void initialize(ValidDateRange constraintAnnotation) {
        this.checkInField = constraintAnnotation.checkInField();
        this.checkOutField = constraintAnnotation.checkOutField();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let @NotNull handle null checks
        }

        try {
            Field checkInFieldObj = value.getClass().getDeclaredField(checkInField);
            Field checkOutFieldObj = value.getClass().getDeclaredField(checkOutField);

            checkInFieldObj.setAccessible(true);
            checkOutFieldObj.setAccessible(true);

            LocalDate checkInDate = (LocalDate) checkInFieldObj.get(value);
            LocalDate checkOutDate = (LocalDate) checkOutFieldObj.get(value);

            if (checkInDate == null || checkOutDate == null) {
                return true; // Let @NotNull handle null checks
            }

            boolean isValid = checkOutDate.isAfter(checkInDate);

            if (!isValid) {
                context.disableDefaultConstraintViolation();
                context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
                        .addPropertyNode(checkOutField)
                        .addConstraintViolation();
            }

            return isValid;

        } catch (NoSuchFieldException | IllegalAccessException e) {
            log.error("Error validating date range", e);
            return false;
        }
    }
}
