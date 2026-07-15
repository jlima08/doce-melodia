import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
    components: {
        button:{
            colorScheme: {
                secondary: {
                background: '#8E7032',
                hoverBackground: '#685124',
                activeBackground: '#ad873b',
                color: '#fff',
                hoverColor: '#fff',
                activeColor: '#fff',
                borderColor: 'transparent',
                hoverBorderColor: 'transparent',
                activeBorderColor: 'transparent',
                },

            }
        }
    }
});

export default MyPreset;
