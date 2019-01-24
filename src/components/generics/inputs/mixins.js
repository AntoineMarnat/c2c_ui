export const baseMixin = {
    props: {
        type: {
            type: String,
            default: 'text'
        },
        disabled: {
            type: Boolean,
            default: null
        },
        required: {
            type: Boolean,
            default: null
        },
        errorMessage: {
            type: String,
            default: null
        },
        i18n: {
            type: Boolean,
            default: false
        },
        divisor: {
            type: Number,
            default: undefined
        },
        helper: {
            type: String,
            default: null
        },
        placeholder: {
            type: String,
            default: null
        }
    },

    computed: {
        value_: {
            get() {
                return this.type !== 'number' || this.divisor === undefined || !this.value ? this.value : this.value / this.divisor
            },
            set(value) {
                if (!this.disabled) {
                    value = this.type !== 'number' || this.divisor === undefined || !value ? value : value * this.divisor
                    this.$emit('input', value)
                }
            }
        },

        hasError() {
            return Boolean(this.errorMessage)
        }
    }
}

export const arrayMixin = {

    props: {
        value: {
            type: Array,
            default: null
        }
    },

    computed: {
        value_: {
            get() {
                return this.value ? this.value : []
            },
            set(value) {
                if (!this.disabled) {
                    this.$emit('input', value)
                }
            }
        }
    },

    methods: {
        toggle(item) {
            if (this.disabled) {
                return
            }

            let newValue = this.value_.slice(0)

            if (!newValue.includes(item)) {
                newValue.push(item)
            } else {
                newValue.splice(newValue.indexOf(item), 1)
            }

            if (newValue.length !== 0 || !this.required) {
                this.value_ = newValue
            }
        }
    }
}
