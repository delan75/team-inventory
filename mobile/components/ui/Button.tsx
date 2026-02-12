import { Button as TamaguiButton, styled } from 'tamagui';

export const Button = styled(TamaguiButton, {
    name: 'Button',
    borderRadius: '$4',
    pressStyle: {
        scale: 0.97,
        opacity: 0.9,
    },
    animation: 'quick',

    variants: {
        variant: {
            primary: {
                backgroundColor: '$primary',
                color: 'white',
                hoverStyle: {
                    backgroundColor: '$primaryHover',
                },
            },
            secondary: {
                backgroundColor: '$backgroundHover',
                color: '$color',
                borderWidth: 1,
                borderColor: '$border',
                hoverStyle: {
                    backgroundColor: '$backgroundPress',
                },
            },
            success: {
                backgroundColor: '$success',
                color: 'white',
            },
            danger: {
                backgroundColor: '$danger',
                color: 'white',
            },
            ghost: {
                backgroundColor: 'transparent',
                color: '$primary',
                hoverStyle: {
                    backgroundColor: '$backgroundHover',
                },
            },
        },
        size: {
            small: {
                height: 36,
                paddingHorizontal: '$3',
                fontSize: '$3',
            },
            medium: {
                height: 44,
                paddingHorizontal: '$4',
                fontSize: '$4',
            },
            large: {
                height: 52,
                paddingHorizontal: '$5',
                fontSize: '$5',
            },
        },
        fullWidth: {
            true: {
                width: '100%',
            },
        },
    } as const,

    defaultVariants: {
        variant: 'primary',
        size: 'medium',
    },
});
