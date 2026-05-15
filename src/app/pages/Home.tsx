import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Activity, Heart, Stethoscope, Clock, CheckCircle2, ArrowRight, AlertCircle, Brain } from "lucide-react";
import { Badge } from "../components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-5 rounded-xl shadow-lg">
              <Stethoscope className="w-14 h-14 text-white" />
            </div>
          </div>
          <h1 className="text-4xl mb-3 text-gray-900">Clinical Reasoning Examination</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-2">
            سامانه ارزیابی مهارت‌های تصمیم‌گیری بالینی
          </p>
          <p className="text-sm text-gray-500 max-w-xl mx-auto">
            Interactive Case-Based Assessment System
          </p>
          <div className="mt-8 flex items-center justify-center gap-8 text-gray-600 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">۳ کیس بالینی</div>
                <div className="text-xs text-gray-500">Clinical Cases</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">مدیریت زمان</div>
                <div className="text-xs text-gray-500">Time Management</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">بازخورد فوری</div>
                <div className="text-xs text-gray-500">Instant Feedback</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Link to="/status-epilepticus" className="group">
            <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white group-hover:border-blue-400">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-red-50 p-2.5 rounded-lg">
                    <Activity className="w-6 h-6 text-red-600" />
                  </div>
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                    Emergency
                  </Badge>
                </div>
                <CardTitle className="text-lg">Status Epilepticus</CardTitle>
                <CardDescription className="text-right text-xs">
                  مدیریت اورژانسی تشنج مداوم
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>بیمار ۳۴ ساله، تشنج &gt;5 دقیقه</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>Non-compliance با Phenytoin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>۴ مرحله تصمیم‌گیری</span>
                  </div>
                </div>
                <div className="text-blue-600 group-hover:text-blue-700 flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                  <span>Start Case</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/hypertension" className="group">
            <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white group-hover:border-blue-400">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg">
                    <Heart className="w-6 h-6 text-blue-600" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    Cardiology
                  </Badge>
                </div>
                <CardTitle className="text-lg">Hypertension Management</CardTitle>
                <CardDescription className="text-right text-xs">
                  تشخیص و درمان فشار خون بالا
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>بیمار با BP 156/92</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>سابقه MI و دیابت</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>۴ مرحله تصمیم‌گیری</span>
                  </div>
                </div>
                <div className="text-blue-600 group-hover:text-blue-700 flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                  <span>Start Case</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to="/pneumonia" className="group">
            <Card className="h-full hover:shadow-lg transition-all duration-200 border border-gray-200 bg-white group-hover:border-blue-400">
              <CardHeader className="border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="bg-purple-50 p-2.5 rounded-lg">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                    Infectious Disease
                  </Badge>
                </div>
                <CardTitle className="text-lg">Community-Acquired Pneumonia</CardTitle>
                <CardDescription className="text-right text-xs">
                  تشخیص و درمان پنومونی
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>بیمار ۳۴ ساله با تب و سرفه</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>CURB-65 Scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                    <span>۴ مرحله تصمیم‌گیری</span>
                  </div>
                </div>
                <div className="text-blue-600 group-hover:text-blue-700 flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                  <span>Start Case</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-3xl mx-auto bg-white border border-gray-200">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">درباره این سیستم ارزیابی</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    این سامانه جهت ارزیابی مهارت‌های Clinical Reasoning و تصمیم‌گیری بالینی طراحی شده است.
                    هر کیس شامل اطلاعات بالینی کامل، مراحل تصمیم‌گیری مرحله‌ای، و بازخورد آموزشی می‌باشد.
                    زمان انجام هر اقدام محاسبه و در گزارش نهایی ارائه می‌شود.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}