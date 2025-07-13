import { ApexOptions } from 'apexcharts'
import avatar3 from '@/assets/images/users/avatar-3.jpg'
import avatar4 from '@/assets/images/users/avatar-4.jpg'
import avatar5 from '@/assets/images/users/avatar-5.jpg'
import avatar6 from '@/assets/images/users/avatar-6.jpg'
import usFlag from '@/assets/images/flags/us.svg'
import inFlag from '@/assets/images/flags/in.svg'
import brFlag from '@/assets/images/flags/br.svg'
import caFlag from '@/assets/images/flags/ca.svg'

export type VisitorTrafficsType = {
  country: string
  flag: string
  count: number
  progress: number
  variant: string
}
export const DatavVisits: ApexOptions = {
  chart: {
    height: 330,
    type: 'donut',
  },
  legend: {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    // verticalAlign: 'middle',
    floating: false,
    fontSize: '14px',
    offsetX: 0,
    offsetY: 7,
  },
  series: [120, 90, 150, 100], // Today's sales data for each category
  labels: ['Electronics', 'Groceries', 'Apparel', 'Others'], // Product categories
  colors: ['#fe6271', '#ff8392', '#ffa5b3', '#ffd2d7'],
  responsive: [
    {
      breakpoint: 600,
      options: {
        chart: {
          height: 240,
        },
        legend: {
          show: false,
        },
      },
    },
  ],
  fill: {
    type: ['gradient'],
    gradient: {
      shade: 'dark',
      gradientToColors: ['#fe6271'],
      type: 'vertical',
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 0.7,
      stops: [0, 100],
    },
  },
}

export const StatisticsChart: ApexOptions = {
  series: [
    {
      name: 'Open Compaign',
      type: 'bar',
      data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57],
    },
  ],
  chart: {
    height: 298,
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  stroke: {
    dashArray: [0, 0, 0, 8],
    width: [0, 0, 2, 2],
    curve: 'smooth',
  },
  fill: {
    opacity: [1, 1],
    type: ['gradient', 'gradient'],
    gradient: {
      shade: 'dark',
      gradientToColors: ['#fe6271'],
      type: 'vertical',
      inverseColors: false,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100],
    },
  },
  markers: {
    size: [0, 0, 0, 0],
    strokeWidth: 2,
    hover: {
      size: 4,
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    stepSize: 25,
    min: 0,
    labels: {
      formatter: function (val) {
        return val + 'k'
      },
      offsetX: -15,
    },
    axisBorder: {
      show: false,
    },
  },
  grid: {
    show: true,
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
    padding: {
      top: 0,
      right: -15,
      bottom: 0,
      left: -15,
    },
  },
  legend: {
    show: true,
    horizontalAlign: 'center',
    offsetX: 0,
    offsetY: -5,
    // markers: {
    //   width: 9,
    //   height: 9,
    //   radius: 6,
    // },
    itemMargin: {
      horizontal: 10,
      vertical: 0,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: '50%',
      barHeight: '70%',
      borderRadius: 3,
    },
  },
  colors: ['#fe8995', '#fbca35'],
  tooltip: {
    shared: true,
    y: [
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '$' + y.toFixed(2) + 'k'
          }
          return y
        },
      },
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '$' + y.toFixed(2) + 'k'
          }
          return y
        },
      },
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '$' + y.toFixed(2) + 'k'
          }
          return y
        },
      },
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '$' + y.toFixed(2) + 'k'
          }
          return y
        },
      },
    ],
  },
}

export const RevenueChart: ApexOptions = {
  series: [
    {
      name: 'Orders',
      type: 'line',
      data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57],
    },
    {
      name: 'Delivered',
      type: 'line',
      data: [22.25, 24.58, 36.74, 22.87, 19.54, 25.03, 29.24, 10.57, 24.57, 35.36, 20.51, 17.57],
    },
  ],
  chart: {
    height: 300,
    type: 'line',
    toolbar: {
      show: false,
    },
  },
  stroke: {
    dashArray: [0, 5],
    width: [2, 2],
    curve: 'smooth',
  },
  fill: {
    opacity: [1, 1],
    type: ['gradient', 'gradient'],
    gradient: {
      shade: 'dark',
      gradientToColors: ['#fe6271'],
      type: 'horizontal',
      shadeIntensity: 1,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100, 100, 100],
    },
  },
  markers: {
    size: [0, 0, 0, 0],
    strokeWidth: 2,
    hover: {
      size: 4,
    },
  },
  xaxis: {
    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    axisTicks: {
      show: false,
    },
    axisBorder: {
      show: false,
    },
  },
  yaxis: {
    stepSize: 25,
    min: 0,
    labels: {
      formatter: function (val) {
        return val + 'k'
      },
      offsetX: -15,
    },
    axisBorder: {
      show: false,
    },
  },
  grid: {
    show: true,
    xaxis: {
      lines: {
        show: false,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 10,
      left: 0,
    },
  },
  legend: {
    show: true,
    horizontalAlign: 'center',
    offsetX: 0,
    offsetY: -5,
    // markers: {
    //   width: 9,
    //   height: 9,
    //   radius: 6,
    // },
    itemMargin: {
      horizontal: 10,
      vertical: 0,
    },
  },
  plotOptions: {
    bar: {
      columnWidth: '50%',
      barHeight: '70%',
      borderRadius: 3,
    },
  },
  colors: ['#fe8995', '#dddddd'],
  tooltip: {
    shared: true,
    y: [
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '$' + y.toFixed(2) + 'k'
          }
          return y
        },
      },
      {
        formatter: function (y) {
          if (typeof y !== 'undefined') {
            return '$' + y.toFixed(2) + 'k'
          }
          return y
        },
      },
    ],
  },
}

export type StatType = {
  title: string
  image: string
  description: string
  change: string
  variant: string
}

export const statData: StatType[] = [
  {
    image: avatar3,
    title: 'Sarah Taylor',
    description: 'sarah.taylor@example.com',
    change: 'Editor',
    variant: 'success',
  },
  {
    image: avatar4,
    title: 'John Doe',
    description: 'john.doe@example.com',
    change: 'Contributor',
    variant: 'warning',
  },
  {
    image: avatar5,
    title: 'Emily Watson',
    description: 'emily.watson@example.com',
    change: 'Subscriber',
    variant: 'info',
  },
  {
    image: avatar6,
    title: 'David Warner',
    description: 'david.warner@example.com',
    change: 'Guest',
    variant: 'danger',
  },
]

export const visitorTrafficsData: VisitorTrafficsType[] = [
  {
    flag: usFlag,
    count: 67.5,
    country: 'United States',
    progress: 72.15,
    variant: 'secondary',
  },
  {
    flag: inFlag,
    count: 7.92,
    country: 'India',
    progress: 28.65,
    variant: 'info',
  },
  {
    flag: brFlag,
    count: 80.05,
    country: 'Brazil',
    progress: 62.5,
    variant: 'warning',
  },
  {
    flag: caFlag,
    count: 5.3,
    country: 'Canada',
    progress: 42.2,
    variant: 'success',
  },
]
