/**
 * Represents a Slider component.
 * @class
 */
class Slider {
  /**
   * Creates an instance of Slider.
   * @constructor
   * @param {Object} options - The options for the Slider.
   * @param {number} [options.slidesPerView=3] - The number of slides per view.
   * @param {number} [options.defaultIndex=0] - The default index of the current slide.
   * @param {number} [options.spaceBetween=20] - The space between slides.
   * @param {number} [options.speed=500] - The transition speed in milliseconds.
   * @param {Array} [options.plugins=[]] - The array of plugins to be used with the Slider.
   * @param {boolean} [options.autoPlay=false] - Determines whether the Slider should autoPlay.
   * @param {number} [options.duration=5000] - The duration between autoPlay transitions in milliseconds.
   * @param {boolean} [options.loop=false] - Determines whether the Slider should loop.
   * @param {string} [options.direction='horizontal'] - The direction of the Slider.
   * @param {boolean} [options.draggable=true] - Determines whether the Slider should be draggable.
   */
  constructor({
    slidesPerView = 3,
    defaultIndex = 0,
    spaceBetween = 20,
    speed = 500,
    plugins = [],
    autoPlay = false,
    duration = 5000,
    loop = false,
    direction = 'horizontal',
    draggable = true,
  }) {
    this.slidesPerView = slidesPerView
    this.defaultIndex = defaultIndex
    this.spaceBetween = spaceBetween
    this.speed = speed
    this.currentSlide = this.defaultIndex
    this.autoPlay = autoPlay
    this.duration = duration
    this.loop = loop
    this.plugins = plugins
    this.direction = direction
    this.draggable = draggable

    this.init()
  }

  /**
   * Initializes the Slider.
   */
  init() {
    $('.slider-slide').each((i, el) => {
      $(el)
        .css(
          'flex',
          `0 0 calc(${
            ($('.slider').width() -
              this.spaceBetween * (this.slidesPerView - 1)) /
            this.slidesPerView
          }px)`
        )
        .css('margin-left', `${this.spaceBetween / 2}px`)
        .css('margin-right', `${this.spaceBetween / 2}px`)
    })

    $('.slider-wrapper')
      .css('margin-left', `-${this.spaceBetween / 2}px`)
      .css('margin-right', `-${this.spaceBetween / 2}px`)
      .css(
        'transform',
        `translateX(-${
          ($('.slider-slide').outerWidth() + this.spaceBetween) *
          this.currentSlide
        }px)`
      )

    if (this.draggable) {
      let isPressed = false
      let startPos = 0
      let distance = 0

      $('.slider-wrapper').mousedown(e => {
        startPos = e.pageX
        isPressed = true
      })

      $(window).mouseup(() => {
        const slideWidth = $('.slider-slide').outerWidth()

        if (
          distance > slideWidth / 3 &&
          (this.loop ||
            this.currentSlide < $('.slider-slide').length - this.slidesPerView)
        ) {
          this.nextSlide()
        } else if (
          -distance > slideWidth / 3 &&
          (this.loop || this.currentSlide > 0)
        ) {
          this.previousSlide()
        } else {
          $('.slider-wrapper').css(
            'transform',
            `translateX(-${
              ($('.slider-slide').outerWidth() + this.spaceBetween) *
              this.currentSlide
            }px)`
          )
        }

        isPressed = false
        startPos = 0
        distance = 0
      })

      $('.slider-wrapper').mousemove(e => {
        if (!isPressed) return
        distance = startPos - e.pageX

        $('.slider-wrapper').css(
          'transform',
          `translateX(${-(
            ($('.slider-slide').outerWidth() + this.spaceBetween) *
              this.currentSlide +
            distance
          )}px)`
        )
      })
    }

    for (let plugin of this.plugins) {
      plugin.init(this)
    }

    if (this.autoPlay) {
      this.#handleAutoPlay()
    }
  }

  /**
   * Changes the current slide to the specified index.
   * @param {number} index - The index of the slide to change to.
   */
  changeSlide(index) {
    this.currentSlide = index
    this.#handleChangeSlide()
  }

  /**
   * Moves to the next slide.
   */
  nextSlide() {
    if (this.loop) {
      if (this.currentSlide < $('.slider-slide').length - this.slidesPerView) {
        this.currentSlide++
      } else {
        this.currentSlide = 0
      }
    } else {
      if (this.currentSlide < $('.slider-slide').length - this.slidesPerView) {
        this.currentSlide++
      }
    }

    this.#handleChangeSlide()
  }

  /**
   * Moves to the previous slide.
   */
  previousSlide() {
    if (this.loop) {
      if (this.currentSlide > 0) {
        this.currentSlide--
      } else {
        this.currentSlide = $('.slider-slide').length - this.slidesPerView
      }
    } else {
      if (this.currentSlide > 0) {
        this.currentSlide--
      }
    }

    this.#handleChangeSlide()
  }

  /**
   * Handles the slide transition.
   * @private
   */
  #handleChangeSlide() {
    $('.slider-wrapper').css('transition', `transform ease-out ${this.speed}ms`)

    $('.slider-wrapper').css(
      'transform',
      `translateX(-${
        ($('.slider-slide').outerWidth() + this.spaceBetween) *
        this.currentSlide
      }px)`
    )

    for (let plugin of this.plugins) {
      plugin.change(this)
    }
  }

  /**
   * Handles the autoPlay functionality.
   * @private
   */
  #handleAutoPlay() {
    setTimeout(() => {
      if (this.autoPlay) {
        if (
          this.currentSlide <
          $('.slider-slide').length - this.slidesPerView
        ) {
          this.nextSlide()
        } else {
          this.changeSlide(0)
        }
        this.#handleAutoPlay()
      }
    }, this.duration)
  }

  /**
   * Represents the Pagination plugin for the Slider.
   * @static
   * @param {Object} options - The options for the Pagination plugin.
   * @param {string} [options.itemClass='slider-pagination-item'] - The class name for each pagination item.
   * @param {string} [options.itemActiveClass='slider-pagination-item--active'] - The class name for the active pagination item.
   * @param {boolean} [options.numbering=true] - Determines whether to display numbering on the pagination items.
   * @param {boolean} [options.clickable=true] - Determines whether the pagination items are clickable.
   * @returns {Object} - The Pagination plugin object.
   */
  static Pagination(
    { itemClass, itemActiveClass, numbering, clickable } = {
      itemClass: 'slider-pagination-item',
      itemActiveClass: 'slider-pagination-item--active',
      numbering: true,
      clickable: true,
    }
  ) {
    function changeActiveState(slider) {
      $(getSelectorFromClass(itemClass)).each((i, el) => {
        if (slider.currentSlide == i) {
          $(el).addClass(itemActiveClass)
        } else {
          $(el).removeClass(itemActiveClass)
        }
      })
    }

    return {
      /**
       * Initializes the Pagination plugin.
       * @param {Slider} slider - The Slider instance.
       */
      init: slider => {
        Array.from(
          Array($('.slider-slide').length - slider.slidesPerView + 1)
        ).forEach((_, i) => {
          $('.slider-pagination').append(
            `<span class='${itemClass}'>${numbering ? i + 1 : ''}</span>`
          )

          changeActiveState(slider)
        })

        if (clickable) {
          $(getSelectorFromClass(itemClass)).each((i, el) => {
            $(el).click(() => {
              slider.changeSlide(i)
              changeActiveState(slider)
              if (slider.autoPlay) {
                slider.autoPlay = false
              }
            })
          })
        }
      },

      /**
       * Updates the active state of the pagination items.
       * @param {Slider} slider - The Slider instance.
       */
      change: changeActiveState,
    }
  }

  /**
   * Represents the Navigation plugin for the Slider.
   * @static
   * @param {Object} options - The options for the Navigation plugin.
   * @param {string} [options.buttonDisabledClass='slider-button--disabled'] - The class name for the disabled navigation buttons.
   * @returns {Object} - The Navigation plugin object.
   */
  static Navigation(
    { buttonDisabledClass } = {
      buttonDisabledClass: 'slider-button--disabled',
    }
  ) {
    function changeDisabledState(slider) {
      if (!slider.loop) {
        if (slider.currentSlide == 0) {
          $('.slider-button-prev').addClass(buttonDisabledClass)
        } else {
          $('.slider-button-prev').removeClass(buttonDisabledClass)
        }

        if (
          slider.currentSlide ==
          $('.slider-slide').length - slider.slidesPerView
        ) {
          $('.slider-button-next').addClass(buttonDisabledClass)
        } else {
          $('.slider-button-next').removeClass(buttonDisabledClass)
        }
      }
    }

    return {
      /**
       * Initializes the Navigation plugin.
       * @param {Slider} slider - The Slider instance.
       */
      init: slider => {
        $('.slider-button-next').click(() => slider.nextSlide())
        $('.slider-button-prev').click(() => slider.previousSlide())
        changeDisabledState(slider)
      },

      /**
       * Updates the disabled state of the navigation buttons.
       * @param {Slider} slider - The Slider instance.
       */
      change: changeDisabledState,
    }
  }
}

/**
 * Converts a class name to a CSS selector.
 *
 * @param {string} cl - The class name to convert.
 * @returns {string} The CSS selector.
 */
function getSelectorFromClass(cl) {
  return `.${cl.replace(/\s/g, '.')}`
}
