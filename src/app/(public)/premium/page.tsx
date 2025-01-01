'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import './premium.scss'
import Logo from '@/assets/img/vnpay-logo.jpg'
import { fetchApiData } from '@/app/api/appService'
import { useAppContext } from '@/app/AppProvider'
const Page = () => {
    const router = useRouter()
    const { accessToken } = useAppContext()
    const handlePay = async (packageId: string) => {
        const payload = {
            packageId: packageId
        }
        try {
            const result = await fetchApiData(
                "/api/payment/create",
                "POST",
                JSON.stringify(payload),
                accessToken
            );
            if (result.success) {
                router.push(result.data.paymentUrl)
            }
        } catch {

        }

    }
    return (
        <div className="relative w-full my-24">
            <div className="banner-premium h-[28rem] w-full">
                <div className="w-[50%] text-left pt-24 ml-32">
                    <h2 className="text-base/7 font-semibold">Premium</h2>
                    <p className="mt-2 text-balance text-5xl font-semibold tracking-tight">Listen unlimited. Try Premium for <br /> 3 months for ₫99,000.</p>
                    <div className='flex gap-7 mt-6'>
                        <button className='px-5 py-2 font-semibold rounded-full bg-[#ff80b5] text-black hover:scale-105 transition-all duration-300'>
                            Buy this
                        </button>
                        <a href='#all-packages' className='px-5 py-2 font-semibold rounded-full border-2 border-white hover:scale-105 transition-all duration-300'>
                            See all packages
                        </a>
                    </div>
                </div>
            </div>
            <div className="absolute inset-x-0 -top-3 -z-10 transform-gpu overflow-hidden px-36 blur-3xl" aria-hidden="true">
                <div className="mx-auto aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
            </div>
            <p className="mx-auto mt-6 text-pretty text-center text-[1.2rem] font-medium text-gray-400 ">Personalize your music listening experience with Premium&apos;s most popular Premium features.</p>
            <div id='all-packages' className="mx-auto pt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                <div className="rounded-3xl rounded-t-3xl bg-white/60 p-8 ring-1 ring-gray-900/10 sm:mx-8 sm:rounded-b-none sm:p-10 lg:mx-0 lg:rounded-bl-3xl lg:rounded-tr-none">
                    <h3 id="tier-hobby" className="text-base/7 font-semibold text-indigo-600">Mini</h3>
                    <p className="mt-4 flex items-baseline gap-x-2">
                        <span className="text-5xl font-semibold tracking-tight text-gray-900">₫10,000</span>
                        <span className="text-base text-gray-500">/week</span>
                    </p>
                    <p className="mt-6 text-base/7 text-gray-600">The perfect plan if you&#039;re just getting started with our product.</p>
                    <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10">
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            Listen to music without ads
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            10 songs download
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            10 songs upload
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            Listen with friends in real time (3 people in room)
                        </li>
                    </ul>
                    <button aria-describedby="tier-hobby"
                        className="w-full mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:mt-10"
                        onClick={() => handlePay('eff9cb0d-cf7d-4d45-9c94-f056e1dd398f')}
                    >
                        Get started today
                    </button>
                </div>
                <div className="relative rounded-3xl bg-gray-900 p-8 shadow-2xl ring-1 ring-gray-900/10 sm:p-10">
                    <h3 id="tier-enterprise" className="text-base/7 font-semibold text-indigo-400">Plus</h3>
                    <p className="mt-4 flex items-baseline gap-x-2">
                        <span className="text-5xl font-semibold tracking-tight text-white">₫99,000</span>
                        <span className="text-base text-gray-400">/3 months</span>
                    </p>
                    <p className="mt-6 text-base/7 text-gray-300">All Plus privileges plus Premium music library.</p>
                    <ul role="list" className="mt-8 space-y-3 text-sm/6 text-gray-300 sm:mt-10">
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            Listen to music without ads
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            Unlimited music storage
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            Unlimited songs upload
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            Listen with friends in real time (10 people in room)
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            One time payment
                        </li>
                        <li className="flex gap-x-3">
                            <svg className="h-6 w-5 flex-none text-indigo-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon">
                                <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clip-rule="evenodd" />
                            </svg>
                            Cancel anytime
                        </li>
                    </ul>
                    <button aria-describedby="tier-hobby"
                        className="w-full mt-8 block rounded-md bg-indigo-500 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 sm:mt-10"
                        onClick={() => handlePay('26570c7a-407c-47f9-8ad2-5848aad6fef3')}
                    >
                        Get started today
                    </button>
                </div>
            </div>
            <div className='flex flex-col items-center text-center mt-24'>
                <p className='text-4xl font-bold mb-3'>Affordable packages for every situation</p>
                <p> Choose a Premium plan to enjoy ad-free music on your phone, speakers, and other devices.</p>
                <p>Easy payment. Cancel anytime.</p>
                <div className='mt-3 shadow-lg'>
                    <Image
                        src={Logo}
                        alt='Logo payment'
                        width={50}
                        height={50}
                    />
                </div>
            </div>
        </div>

    )
}

export default Page